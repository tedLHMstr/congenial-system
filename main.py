from Indexer.Elasticsearch import Elastic
from Parser.Parser import CodeParser
from Crawler.Crawler import Crawler
import os
from dotenv import load_dotenv

def enrich_index(GITHUB_ACCESS_TOKEN: str, es: Elastic):
    """
    Enrich the index with the data from crawling + parsing
    """
    parser = CodeParser("java")
    crawler = Crawler("java", access_token=GITHUB_ACCESS_TOKEN)

    dateRanges = [
        "2023-01-01..2023-01-10",
        # "2021-01-16..2021-01-31",
        # "2021-02-01..2021-02-15",
        # "2021-02-16..2021-02-28",
    ]

    # Search repos within the specified date range
    for dateRange in dateRanges:
        query = f"created:{dateRange} language:Java sort"
        repos = crawler.search_repos(query)
        print(repos.totalCount)

        for repo in repos:
            print("Processing repo: ", repo.name)
            java_files = crawler.get_java_files(repo)
            print("Repo: ", repo.name, "contains", len(java_files), "java files")
            for java_file in java_files:
                parsed_java_file = parser.parseFile(java_file['code'].decoded_content.decode("utf-8"))
                
                if parsed_java_file is None:
                    continue
                else: 
                    for class_ in parsed_java_file["classes"]:
                        es_doc = class_ 
                        es_doc["url"] = java_file['url']
                        es_doc["download_url"] = java_file['download_url']
                    
                        es.index(es_doc)
            
    print("Done indexing")

if __name__ == "__main__":
    load_dotenv(".env")
    GITHUB_ACCESS_TOKEN = os.getenv("GITHUB_ACCESS_TOKEN")
    es = Elastic('')

    es.create_index()

    # crawler = Crawler("java", access_token=GITHUB_ACCESS_TOKEN)
    # repos = crawler.search_repos("created:2021-01-01..2021-01-02 stars:>10 language:Java")

    enrich_index(GITHUB_ACCESS_TOKEN, es)