from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from Indexer.Elasticsearch import Elastic

es = Elastic("")

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

@app.get("/search")
async def search(query: str):
    res = es.search(query)
    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="localhost", port=8000)
