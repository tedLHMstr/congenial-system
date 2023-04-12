# GitHub Search Engine - DD2477 Project
## Dependencies
- ```dotenv```
- ```PyGithub```
- ```javalang```

## Get Started
### GitHub Search API (PyGithub) 
1. Generate GitHub Access Token [Follow instructions on this page](https://python.gotrained.com/search-github-api/)
2. Create a ```.env``` file in the root directory of the repository and create the following environment variable: ```GITHUB_ACCESS_TOKEN='your key here'```

### Parser
The parser is based on the python module ```javalang``` with some modifications to make indexing of tokens more user friendly
