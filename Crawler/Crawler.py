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

if __name__ == "__main__":
    from dotenv import load_dotenv
    import os

    load_dotenv("../.env")

    crawler = Crawler("java", access_token=os.getenv("GITHUB_ACCESS_TOKEN"))
    res = crawler.search()
    
        