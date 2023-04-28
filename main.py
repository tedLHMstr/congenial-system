# imoport Elastic # Import the elastic indexer object
from Parser.Parser import CodeParser
from Crawler.Crawler import Crawler
import os
from dotenv import load_dotenv

def enrich_index(GITHUB_ACCESS_TOKEN):
    """
    Enrich the index with the data from crawling + parsing
    """
    parser = CodeParser("java")
    crawler = Crawler("java", access_token=GITHUB_ACCESS_TOKEN)

    dateRanges = [
        "2021-01-01..2021-01-02",
        # "2021-01-16..2021-01-31",
        # "2021-02-01..2021-02-15",
        # "2021-02-16..2021-02-28",
    ]

    # Search repos within the specified date range
    for dateRange in dateRanges:
        query = f"created:{dateRange} stars:>10 language:Java"
        repos = crawler.search_repos(query)
        print(repos.totalCount)

        for repo in repos:
            print("Processing repo: ", repo.name)
            java_files = crawler.get_java_files(repo)
            print("Repo: ", repo.name, "contains", len(java_files), "java files")
            for java_file in java_files:
                parsed_java_file = parser.parseFile(java_file['code'].decoded_content.decode("utf-8"))
                print(parsed_java_file, java_file['url'])

            #     # Add the parsed java file to the index
            #     Elastic.index_java_file(parsed_java_file, java_file['url'])

if __name__ == "__main__":
    load_dotenv(".env")
    GITHUB_ACCESS_TOKEN = os.getenv("GITHUB_ACCESS_TOKEN")

    # crawler = Crawler("java", access_token=GITHUB_ACCESS_TOKEN)
    # repos = crawler.search_repos("created:2021-01-01..2021-01-02 stars:>10 language:Java")

    enrich_index(GITHUB_ACCESS_TOKEN)