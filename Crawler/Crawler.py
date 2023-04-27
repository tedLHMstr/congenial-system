from github import Github

class Crawler:
    def __init__(self, lang, access_token):
        if lang == "java":
            self.lang = lang
        else: 
            raise Exception("Language not supported")
        
        self.g = Github(access_token)
        
    def search(self):

        rate_limit = self.g.get_rate_limit()
        rate = rate_limit.search
        if rate.remaining == 0:
            print(f'You have 0/{rate.limit} API calls remaining. Reset time: {rate.reset}')
            return
        else:
            print(f'You have {rate.remaining}/{rate.limit} API calls remaining, reset time: {rate.reset}')

        query = "bubblesort hej language:Java"

        try:
            result = self.g.search_code(query, order='desc')
        except Github.RateLimitExceededException as e:
            print("Rate limit exceeded")
            return
        except Exception as e:
            print("Error: ", e)
            return

        return result

    def search_repos(self, query):
        rate_limit = self.g.get_rate_limit()
        rate = rate_limit.search
        if rate.remaining == 0:
            print(f'You have 0/{rate.limit} API calls remaining. Reset time: {rate.reset}')
            return
        else:
            print(f'You have {rate.remaining}/{rate.limit} API calls remaining, reset time: {rate.reset}')

        try:
            result = self.g.search_repositories(query, order='desc')

        except Github.RateLimitExceededException as e:
            print("Rate limit exceeded")
            return
        except Exception as e:
            print("Error: ", e)
            return

        return result

    
    # Recursive function that gets the path of a .java file and returns the decoded content
    def get_java_files(self, repo):
        java_files = []
        contents = repo.get_contents("")

        while contents:
            content = contents.pop(0)
            if content.type == "dir":
                contents.extend(repo.get_contents(content.path))
            elif content.type == "file" and content.name.endswith(".java"):
                java_files.append({'code': content, 'url': content.html_url})

        return java_files

if __name__ == "__main__":
    from dotenv import load_dotenv
    import os

    load_dotenv("../.env")

    crawler = Crawler("java", access_token=os.getenv("GITHUB_ACCESS_TOKEN"))
    # res = crawler.search()
    
        