from elasticsearch import Elasticsearch


class Elastic:
    es = None
    elastic_index = ""

    def __init__(self, elastic_password):
        self.es = Elasticsearch("http://localhost:9200", basic_auth=("elastic", elastic_password), verify_certs=False)
        self.elastic_index = 'java'

    def create_index(self):
        index_settings = {
            "mappings": {
                "properties": {
                    "url": {"type": "keyword"},
                    "className": {"type": "keyword"},
                    "modifiers": {"type": "text"},
                    "methods": {
                        "type": "nested",
                        "properties": {
                            "methodName": {"type": "text"},
                            "returnType": {"type": "keyword"},
                            "parameters": {
                                "type": "nested",
                                "properties": {
                                    "name": {"type": "keyword"},
                                    "type": {"type": "keyword"}
                                }
                            },
                            "line": {"type": "integer"},
                            "modifiers": {"type": "text"}
                        }
                    },
                    "line": {"type": "integer"}
                }
            }
        }
        self.es.indices.create(index=self.elastic_index, body=index_settings)


    """
    This method uses the result of the parser without making any changes.
    Since all codes are written in java, index is given hard coded. 
    """
    def index(self, doc):
        try:
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
        formatted_query = self.format_query(query)
        response = self.es.search(index=self.elastic_index, query=formatted_query)
        return response


    def delete(self, index):
        self.es.indices.delete(index=index)
    """
    Query Format: 
    ClassName UNION & ?(methodNames, returnTypes) & ?Modifiers
                            OR
    MethodName & ?returnType & ?(parameterName, type) & ?Modifiers
    """
    @staticmethod
    def format_query(query):
        is_class_query = False
        if "className" in query:
            is_class_query = True
        formatted_query = {
            "bool": {
                "must": []
            }
        }
        method_index = -1
        if 'methodName' in query or 'returnType' in query:
            method_query = {
                "nested": {
                    "path": "methods",
                    "query": {
                        "bool": {
                            "must": [
                            ]
                        }
                    }
                }
            }
            formatted_query['bool']['must'].append(method_query)
            method_index = len(formatted_query['bool']['must']) - 1

        if 'parameters' in query:
            formatted_query['bool']['must'][method_index]['nested']['query']['bool']['should'] = []


        sub_query_list = query.split("AND")
        for element in sub_query_list:
            should_terms = element.split("OR")
            is_multiple = len(should_terms) > 1
            for term_index in range(len(should_terms)):
                is_first_term = term_index == 0
                term = should_terms[term_index]
                key_value = term.split(":")
                key = key_value[0].strip()
                value = key_value[1].strip()

                if key == 'className':
                    if is_multiple:
                        if is_first_term:
                            term_query = {
                                "bool": {
                                    "should": [
                                            {
                                                "fuzzy": {
                                                    "className": {
                                                        "value": value,
                                                        "fuzziness": "AUTO"
                                                    }
                                                }
                                            }
                                    ]
                                }
                            }
                            formatted_query['bool']['must'].append(term_query)
                        else:
                            term_query = {
                                "fuzzy": {
                                    "className": {
                                        "value": value,
                                        "fuzziness": "AUTO"
                                    }
                                }
                            }
                            formatted_query['bool']['must'][-1]['bool']['should'].append(term_query)
                    else:
                        term_query = {
                            "fuzzy": {
                                "className": {
                                    "value": value,
                                    "fuzziness": "AUTO"
                                }
                            }
                        }
                        formatted_query['bool']['must'].append(term_query)

                elif key == 'methodName':
                    if is_multiple:
                        if is_first_term:
                            term_query = {
                                "bool": {
                                    "should":
                                        [
                                            {
                                                "fuzzy":
                                                    {
                                                        "methods.methodName": {
                                                            "value": value,
                                                            "fuzziness": "AUTO"
                                                        }
                                                    }
                                            }
                                        ]
                                }
                            }
                            formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must']\
                                .append(term_query)
                        else:
                            term_query = {
                                "fuzzy":
                                    {
                                        "methods.methodName": {
                                            "value": value,
                                            "fuzziness": "AUTO"
                                        }
                                    }
                            }
                            formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must'][-1][
                                'bool']['should'].append(term_query)
                    else:
                        term_query = {
                            "fuzzy":
                                {
                                    "methods.methodName": {
                                        "value": value,
                                        "fuzziness": "AUTO"
                                    }
                                }
                        }
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
                                                "fuzzy":
                                                    {
                                                        "methods.returnType": {
                                                            "value": value,
                                                            "fuzziness": "AUTO"
                                                        }
                                                    }
                                            }
                                        ]
                                }
                            }
                            formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must']\
                                .append(term_query)
                        else:
                            term_query = {
                                "fuzzy":
                                    {
                                        "methods.returnType": {
                                            "value": value,
                                            "fuzziness": "AUTO"
                                        }
                                    }
                            }
                            formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must'][-1][
                                'bool']['should'].append(term_query)
                    else:
                        term_query = {
                            "fuzzy":
                                {
                                    "methods.returnType": {
                                        "value": value,
                                        "fuzziness": "AUTO"
                                    }
                                }
                        }
                        formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must']\
                            .append(term_query)
                elif key == 'modifiers':
                    if is_class_query:
                        values = value.split("-")
                        for modifier in values:
                            term_query = {
                                "fuzzy": {
                                    "modifiers": {
                                        "value": modifier,
                                        "fuzziness": "AUTO"
                                    }
                                }
                            }
                            formatted_query['bool']['must'].append(term_query)
                    else:
                        values = value.split("-")
                        for modifier in values:

                            term_query = {
                                "fuzzy":
                                    {
                                        "methods.modifiers": {
                                            "value": modifier,
                                            "fuzziness": "AUTO"
                                        }
                                    }
                            }
                            formatted_query['bool']['must'][method_index]['nested']['query']['bool']['must'].append(
                                term_query)

                elif key == 'parameters':
                    all_params = value.split("-")
                    for params in all_params:
                        values = params.split(",")
                        name = values[0]
                        type = values[1]
                        term_query = {
                            "nested": {
                                "path": "methods.parameters",
                                "query": {
                            "bool": {
                                "must": [
                                    {
                                        "fuzzy":
                                            {
                                                "methods.parameters.name": {
                                                    "value": name,
                                                    "fuzziness": "AUTO"
                                                }
                                            }
                                    },
                                    {
                                        "fuzzy":
                                            {
                                                "methods.parameters.type": {
                                                    "value": type,
                                                    "fuzziness": "AUTO"
                                                }
                                            }
                                    }
                                ]
                            },
                                }
                            }
                        }
                        should_list = formatted_query['bool']['must'][method_index]['nested']['query']['bool']['should']
                        should_list.append(term_query)


        # print("Query: " + str(formatted_query))
        return formatted_query

if __name__ == "__main__":
    e = Elastic("")

    query =  "methodName:bubble_srot AND returnType:int[] AND parameters: arr,int AND modifiers: public"
    res = e.search(query)
    for hit in res["hits"]["hits"]:
        print("\n", hit["_score"])
        print(hit["_source"])
