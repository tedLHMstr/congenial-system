from elasticsearch import Elasticsearch
from elasticsearch_dsl import (
    Q,
    Search,
)

class ElasticIndexer:
    def __init__(self, elasticPassword):
        self.es = Elasticsearch("http://localhost:9200", basic_auth=("elastic", elasticPassword), verify_certs=False)

    def buildMethodQuery(self, query_string):
        # Parse query string into a dictionary
        query_dict = {}
        for pair in query_string.split(';'):
            key, value = pair.split(':')
            if key == 'methodName' and value == '':
                continue
            if key == 'modifiers':
                value = value.split(',')
            elif key == 'parameters':
                param_list = []
                for param_pair in value.split(','):
                    param_key, param_value = param_pair.split('$')
                    param_list.append({param_key: param_value})
                value = param_list
            query_dict[key] = value

        # Build Elasticsearch DSL query
        query = Search().query('bool')
        must_list = []
        should_list = []

        # Add methodName fuzzy query
        if 'methodName' in query_dict:
            method_name_prefix_query = Q('prefix', methodName=query_dict['methodName'])
            method_name_fuzzy_query = Q('fuzzy', methodName={'value': query_dict['methodName'], 'fuzziness': 'AUTO', 'transpositions': True})
            method_name_exact_query = Q('term', methodName={'value': query_dict['methodName'], 'boost': 2})
            method_name_query = Q('bool', should=[method_name_prefix_query, method_name_fuzzy_query, method_name_exact_query], boost=2.0)
            must_list.append(method_name_query)

            
        # Add returnType term query
        if 'returnType' in query_dict:
            return_type_query = Q('term', returnType={'value': query_dict['returnType'], 'boost': 1})
            should_list.append(return_type_query)

        if 'parameters' in query_dict and len(query_dict['parameters']) > 0:
            param_should_list = []

            # Add nested parameter queries
            for param_dict in query_dict['parameters']:
                param_name = list(param_dict.keys())[0]
                param_type = param_dict[param_name]
                param_query = Q('nested', path='parameters', query=Q('bool', must=[Q('match', **{'parameters.name': {'query': param_name, 'fuzziness': 1}}), Q('match', **{'parameters.type': {'query': param_type, 'fuzziness': 1}})]))
                param_should_list.append(param_query)

            should_list.append(Q('bool', should=param_should_list))

        if 'modifiers' in query_dict and len(query_dict['modifiers']) > 0:
            # Add modifiers term queries
            modifier_should_list = []
            for modifier in query_dict['modifiers']:
                modifier_query = Q('term', modifiers={'value': modifier})
                modifier_should_list.append(modifier_query)
            mod_q = Q('bool', should=modifier_should_list, minimum_should_match=len(query_dict['modifiers']), boost=2)
            should_list.append(mod_q)

        # Add must and should clauses to main query
        if len(must_list) > 0:
            query = query.query('bool', must=must_list, should=should_list)
        else:
            query = query.query('bool', should=should_list, minimum_should_match=len(should_list))

        return query.to_dict()
    
    def buildClassQuery(self, query_string):

        query_dict = {}
        for pair in query_string.split(';'):
            key, value = pair.split(':')
            if key == 'className' and value == '':
                continue
            if key == 'modifiers' or key == 'methods':
                value = value.split(',')
            query_dict[key] = value

        query = Search().query('bool')
        must_list = []
        should_list = []

        # Add className fuzzy query
        if 'className' in query_dict:
            class_name_fuzzy_query = Q('fuzzy', className={'value': query_dict['className'], 'fuzziness': 'AUTO', 'max_expansions': 50, 'prefix_length': 0, 'transpositions': True, 'rewrite': 'constant_score', 'boost': 4})
            class_name_prefix_query = Q('prefix', className=query_dict['className'])
            class_name_query = Q('bool', should=[class_name_fuzzy_query, class_name_prefix_query])
            must_list.append(class_name_query)

        # Add methods term query
        if 'methods' in query_dict and len(query_dict['methods']) > 0:
            for method in query_dict['methods']:
                method_query = Q('term', methods={'value': method, 'boost': 0.7})
                should_list.append(method_query)

        # Add modifiers term queries
        if 'modifiers' in query_dict and len(query_dict['modifiers']) > 0:
            for modifier in query_dict['modifiers']:
                modifier_query = Q('term', modifiers={'value': modifier, 'boost': 0.7})
                should_list.append(modifier_query)

        # Add must and should clauses to main query
        if len(must_list) > 0:
            query = query.query('bool', must=must_list, should=should_list)
        else:
            query = query.query('bool', should=should_list)

        return query.to_dict()

    def searchMethods(self, indexName, query):
        q = self.buildMethodQuery(query)
        print(q)
        return self.es.search(index=indexName, body=q, size=100)

    def searchClasses(self, indexName, query):
        q = self.buildClassQuery(query)
        return self.es.search(index=indexName, body=q, size=100)
    
    def create_index(self, indexName, mapping=None):
        if not self.es.indices.exists(index=indexName):
            if mapping is None:
                self.es.indices.create(index=indexName)
            else:
                self.es.indices.create(index=indexName, body=mapping)
        else:
            print("Index already exists.")

    def index(self, indexName, doc):
        try:
            self.es.index(index=indexName, body=doc)
        except Exception as e:
            print("Indexing failed. Reason:")
            print(str(e))


if __name__ == '__main__':
    methodIndexMapping = {
        "mappings": {
            "properties": {
            "methodName": {
                "type": "keyword"
            },
            "modifiers": {
                "type": "text"
            },
            "parameters": {
                "type": "nested",
                "properties": {
                "name": {
                    "type": "keyword"
                },
                "type": {
                    "type": "keyword"
                }
                }
            },
            "line": {
                "type": "integer"
            },
            "returnType": {
                "type": "keyword"
            },
            "url": {
                "type": "keyword"
            },
            "download_url": {
                "type": "keyword"
            }
            }
        }
    }

    input_ = "methodName:mergeSotr;returnType:int[];modifiers:public,static;parameters:arr$int[],n$string"

    indexer = ElasticIndexer('password')
    indexer.create_index('java_method_index', methodIndexMapping)

    res = indexer.searchMethods(indexName='java_method_index', query=input_,)
    print(res)


        