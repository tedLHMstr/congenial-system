from elasticsearch import Elasticsearch
from datetime import datetime

ELASTIC_PASSWORD = '8JLfSQS5uM8bYmJrPrRN'

ELASTIC_INDEX = 'favorite_candy'

es = Elasticsearch("http://localhost:9200", basic_auth=("elastic", ELASTIC_PASSWORD), verify_certs=False)
doc = {
    'author': 'author_name3',
    'text': ["content1", "content2"],
    'timestamp': datetime.now(),
}
doc2 = {
    'author': 'author_name2',
    'text': ["content2", "content3"],
    'timestamp': datetime.now(),
}
es.index(index=ELASTIC_INDEX, document=doc)
es.index(index=ELASTIC_INDEX, document=doc2)
resp = es.search(index=ELASTIC_INDEX, query={"bool": { "must": [ { "match": { "author": "author_name3" } }, { "match": { "text": "content1" } } ] } })
print(resp)
