from elasticsearch import Elasticsearch
from datetime import datetime

ELASTIC_PASSWORD = 'CbK08A4lO9_HrN8ieo0W'

ELASTIC_INDEX = 'favorite_candy'

es = Elasticsearch("https://localhost:9200", basic_auth=("elastic", ELASTIC_PASSWORD), verify_certs=False)

resp = es.search(index=ELASTIC_INDEX, body={"query": {"match_all": {}}})
print(resp)