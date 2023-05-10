# GitHub Search Engine - DD2477 Project
## Dependencies
- ```dotenv```
- ```PyGithub```
- ```javalang```
- ```fastapi```
- ```numpy```
- ```uvicorn```

## Get Started
### GitHub Search API (PyGithub) 
1. Generate GitHub Access Token [Follow instructions on this page](https://python.gotrained.com/search-github-api/)
2. Create a ```.env``` file in the root directory of the repository and create the following environment variable: ```GITHUB_ACCESS_TOKEN='your key here'```

### Web Interface
The web interface is built using React + Next.js.
To start he UI:
1. ```cd congenial-system-web```
2. Install dependencies with ```yarn```
3. Start server with ```yarn dev```

### Python API
The Python API is built with FastAPI, and handles formatting of queries sent from the user through the UI. 
It takes a string representation of the query and uses the Python package ```elasticsearch_dsl``` to build and format a suitable query.
Start the API by running ```make local``` while in the root directory of the repository. 

### Crawler
The Crawler takes advantage of the Python package PyGithub to make requests to the Github Search API. The implemented crawler uses the ```search_repositories``` method and takes a query (on Github format) as parameter. For our use case, such query might look like: ```"created:2023-01-01..2023-01-31 language:Java"```. 

### Parser
The Parser is built on the Python package ```javalang``` to parse Java code into a tree with corresponding fields. 

### Indexer
The search engine is built on Elastic Search Index. A prerequisite to running this system locally, is that you have an index running locally on ```PORT:9200```.
The index consist of methods for both searching and indexing documents. 
 
