from elasticsearch import Elasticsearch


class Elastic:
    es = None
    elastic_index = ""

    def __init__(self, elastic_password):
        self.es = Elasticsearch("http://localhost:9200", basic_auth=("elastic", elastic_password), verify_certs=False)
        self.elastic_index = 'java'

    """
    This method uses the result of the parser without making any changes.
    Since all codes are written in java, index is given hard coded. 
    """
    def index(self, doc):
        try:
            index_settings = {
                "mappings": {
                    "properties": {
                        "classes": {
                            "type": "nested",
                            "properties": {
                                "name": {"type": "text"},
                                "methods": {
                                    "type": "nested",
                                    "properties": {
                                        "name": {"type": "keyword"},
                                        "return_type": {
                                            "properties": {
                                                "name": {"type": "keyword"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            self.es.indices.create(index=self.elastic_index, body=index_settings)
            self.es.index(index=self.elastic_index, body=doc)
        except Exception as e:
            print("Indexing failed. Reason:")
            print(str(e))

    """
    Formats given query accordingly. 
    Makes a search with formatted query to find related docs.
    Returns the matching documents.
    """
    def search(self, query):
        try:
            formatted_query = self.format_query(query)
            response = self.es.search(index=self.elastic_index, query=formatted_query)
            return response
        except Exception as e:
            print("Search failed. Reason:")
            print(str(e))

    def delete(self, index):
        self.es.indices.delete(index=index)
    """
    Example Query:
    className:A AND methodName:B OR methodName:D AND returnType:C - methodName:K
    """
    @staticmethod
    def format_query(query):
        query_list = query.split("-")
        is_multiple_queries = len(query_list) > 1
        formatted_query = {
            "bool": {
                "must": []
            }
        }
        if is_multiple_queries:
            formatted_query = {
                "bool": {
                    "should": []
                }
            }
        for sub_query in query_list:
            sub_query_list = sub_query.split("AND")
            if is_multiple_queries:
                multiple_query = {
                    "bool": {
                        "must": []
                    }
                }
                formatted_query['bool']['should'].append(multiple_query)
            method_index = 0
            if 'methodName' in sub_query or 'returnType' in sub_query:
                method_query = {
                    "nested": {
                        "path": "classes.methods",
                        "query": {
                            "bool": {
                                "must": [
                                ]
                            }
                        }
                    }
                }
                if is_multiple_queries:
                    formatted_query['bool']['should'][-1]['bool']['must'].append(method_query)
                    method_index = len(formatted_query['bool']['should'][-1]['bool']['must']) - 1
                else:
                    formatted_query['bool']['must'].append(method_query)
                    method_index = len(formatted_query['bool']['must']) - 1

            for element in sub_query_list:
                should_terms = element.split("OR")
                or_check = set()
                is_multiple = len(should_terms) > 1
                for term_index in range(len(should_terms)):
                    is_first_term = term_index == 0
                    term = should_terms[term_index]
                    key_value = term.split(":")
                    key = key_value[0].strip()
                    value = key_value[1].strip()
                    or_check.add(key)

                    if len(or_check) > 1:
                        print("OR operator cannot be used for different types -> " ' and '.join(or_check))
                        return -1

                    if key == 'className':
                        if is_multiple:
                            if is_first_term:
                                term_query = {
                                    "bool": {
                                        "should": [
                                                {
                                                    "nested": {
                                                      "path": "classes",
                                                      "query": {
                                                        "match": {
                                                          "classes.name": value
                                                        }
                                                      }
                                                    }
                                                }
                                        ]
                                    }
                                }
                                if is_multiple_queries:
                                    formatted_query['bool']['should'][-1]['bool']['must'].append(term_query)
                                else:
                                    formatted_query['bool']['must'].append(term_query)
                            else:
                                term_query = {
                                            "nested": {
                                              "path": "classes",
                                              "query": {
                                                "match": {
                                                  "classes.name": value
                                                }
                                              }
                                            }
                                }
                                if is_multiple_queries:
                                    formatted_query['bool']['should'][-1]['bool']['must'][-1]["bool"]["should"]\
                                        .append(term_query)
                                else:
                                    formatted_query['bool']['must'][-1]['bool']['should'].append(term_query)
                        else:
                            term_query = {
                                "nested": {
                                    "path": "classes",
                                    "query": {
                                        "match": {
                                            "classes.name": value
                                        }
                                    }
                                }
                            }
                            if is_multiple_queries:
                                formatted_query['bool']['should'][-1]['bool']['must'].append(term_query)
                            else:
                                formatted_query['bool']['must'].append(term_query)

                    elif key == 'methodName':
                        if is_multiple:
                            if is_first_term:
                                term_query = {
                                    "bool": {
                                        "should":
                                            [
                                                {
                                                    "match":
                                                    {
                                                         "classes.methods.name": value
                                                    }
                                                }
                                            ]
                                    }
                                }

                                if is_multiple_queries:
                                    should_clause = formatted_query['bool']['should'][-1]
                                    must_clause = should_clause['bool']['must'][method_index]['nested']['query']['bool']['must']
                                    must_clause.append(term_query)
                                else:
                                    formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must'].append(term_query)
                            else:
                                term_query = {"match": {"classes.methods.name": value}}
                                if is_multiple_queries:
                                    should_clause = formatted_query['bool']['should'][-1]
                                    must_clause = should_clause['bool']['must'][method_index]['nested']['query']['bool']['must'][-1]
                                    should_clause_inner = must_clause["bool"]["should"]
                                    should_clause_inner.append(term_query)
                                else:
                                    nested_query = formatted_query['bool']['must'][method_index]['nested']['query']
                                    must_clauses = nested_query['bool']['must']
                                    last_must_clause = must_clauses[-1]
                                    should_clauses = last_must_clause['bool']['should']
                                    should_clauses.append(term_query)
                        else:
                            term_query = {"match": {"classes.methods.name": value}}
                            if is_multiple_queries:
                                should_clause = formatted_query['bool']['should'][-1]
                                must_clause = should_clause['bool']['must'][method_index]['nested']['query']['bool']['must']
                                must_clause.append(term_query)
                            else:
                                formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must']\
                                    .append(term_query)

                    elif key == 'returnType':
                        if is_multiple:
                            if is_first_term:
                                term_query = {
                                    "bool": {
                                        "should":
                                            [
                                                {
                                                    "match":
                                                        {
                                                            "classes.methods.return_type.name": value
                                                        }
                                                }
                                            ]
                                    }
                                }
                                if is_multiple_queries:
                                    should_clause = formatted_query['bool']['should'][-1]
                                    must_clause = should_clause['bool']['must'][method_index]['nested']['query']['bool']['must']
                                    must_clause.append(term_query)
                                else:
                                    formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must']\
                                        .append(term_query)
                            else:
                                term_query = {"match": {"classes.methods.return_type.name": value}}
                                if is_multiple_queries:
                                    should_clause = formatted_query['bool']['should'][-1]
                                    must_clause = should_clause['bool']['must'][method_index]['nested']['query']['bool']['must'][-1]
                                    should_clause_inner = must_clause["bool"]["should"]
                                    should_clause_inner.append(term_query)
                                else:
                                    nested_query = formatted_query['bool']['must'][method_index]['nested']['query']
                                    must_clauses = nested_query['bool']['must']
                                    last_must_clause = must_clauses[-1]
                                    should_clauses = last_must_clause['bool']['should']
                                    should_clauses.append(term_query)
                        else:
                            term_query = {"match": {"classes.methods.return_type.name": value}}
                            if is_multiple_queries:
                                should_clause = formatted_query['bool']['should'][-1]
                                must_clause = should_clause['bool']['must'][method_index]['nested']['query']['bool']['must']
                                must_clause.append(term_query)
                            else:
                                formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must']\
                                    .append(term_query)
        print("Query: " + str(formatted_query))
        return formatted_query

