from Indexer.Searcher import ElasticIndexer
from Parser.Parser import CodeParser
from Crawler.Crawler import Crawler
import os
from dotenv import load_dotenv

def enrich_index(GITHUB_ACCESS_TOKEN: str, es: ElasticIndexer, methodIndexName: str, classIndexName: str, dateRanges: list, keyword:str=None):
    """
    Enrich the index with the data from crawling + parsing
    """
    parser = CodeParser("java")
    crawler = Crawler("java", access_token=GITHUB_ACCESS_TOKEN)

    filesIndexed = 0

    # Search repos within the specified date range
    for dateRange in dateRanges:
 
        query = f"created:{dateRange} language:Java" + " " + keyword
        repos = crawler.search_repos(query)
        print(repos.totalCount)

        for repo in repos[0:100]:
            print("Processing repo: ", repo.name)
            java_files = crawler.get_java_files(repo)
            print("Repo: ", repo.name, "contains", len(java_files), "java files")
            for java_file in java_files:
                parsed_java_file = parser.parseFile(java_file['code'].decoded_content.decode("utf-8"))
                
                if parsed_java_file is None:
                    continue
                else: 
                    for class_ in parsed_java_file["classes"]:
                        class_doc = {
                            "className": class_["className"],
                            "modifiers": class_["modifiers"],
                            "methods": [],
                            "url": java_file['url'],
                            "download_url": java_file['download_url'],
                            "line": class_["line"]
                        }

                        for method in class_["methods"]:
                            es_doc = method
                            es_doc["url"] = java_file['url']
                            es_doc["download_url"] = java_file['download_url']
                            class_doc["methods"].append(method["methodName"])
                    
                            es.index(indexName=methodIndexName, doc=es_doc)

                        es.index(indexName=classIndexName, doc=class_doc)
                    filesIndexed += 1

    print("Done indexing", filesIndexed, "files")

if __name__ == "__main__":
    load_dotenv(".env")
    GITHUB_ACCESS_TOKEN = os.getenv("GITHUB_ACCESS_TOKEN")

    methodIndexMapping = {
        "mappings": {
            "properties": {
            "methodName": {
                "type": "text"
            },
            "modifiers": {
                "type": "text"
            },
            "parameters": {
                "type": "nested",
                "properties": {
                "name": {
                    "type": "keyword"
                },
                "type": {
                    "type": "keyword"
                }
                }
            },
            "line": {
                "type": "integer"
            },
            "returnType": {
                "type": "keyword"
            },
            "url": {
                "type": "keyword"
            },
            "download_url": {
                "type": "keyword"
            }
            }
        }
    }
    
    classIndexMapping = {
        "mappings": {
            "properties": {
            "className": {
                "type": "keyword"
            },
            "modifiers": {
                "type": "keyword"
            },
            "line": {
                "type": "integer"
            },
            "url": {
                "type": "keyword"
            },
            "download_url": {
                "type": "keyword"
            },
            "methods": {
                "type": "keyword"
            }
            }
        }
    }

    indexer = ElasticIndexer('password')

    indexer.create_index('java_method_index', methodIndexMapping)
    indexer.create_index('java_class_index', classIndexMapping)

    dateRanges = [
        "2021-02-01..2021-02-28",
        # "2021-01-16..2021-01-31",
        # "2021-02-01..2021-02-15",
        # "2021-02-16..2021-02-28",
    ]

    enrich_index(GITHUB_ACCESS_TOKEN, indexer, 'java_method_index', 'java_class_index', dateRanges, keyword="spring")