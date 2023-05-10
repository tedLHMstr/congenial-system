from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Indexer.Elasticsearch import Elastic
from Indexer.Searcher import ElasticIndexer

# es = Elastic("")
indexer = ElasticIndexer('')

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"Congenial System API": "Running"}

@app.get("/searchMethod")
async def searchMethods(query: str):
    try: 
        res = indexer.searchMethods(indexName='java_method_index', query=query)
        return res
    except Exception as e:
        print("Error:", e)
        return

@app.get("/searchClass")
async def searchClasses(query: str):
    try:
        res = indexer.searchClasses(indexName='java_class_index', query=query)
        return res
    except:
        return

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
