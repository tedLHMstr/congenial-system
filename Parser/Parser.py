import javalang
from Indexer.Elasticsearch import Elastic


class CodeParser:
    def __init__(self, lang):
        if lang == "java":
            self.lang = lang
        else: 
            raise Exception("Language not supported")

    """ 
    Parses a file in str format and @returns an object containing the parsed code
    Object:
        - package
        - imports
        - classes (Array)
            - class
                - name
                - line
                - modifiers
                - methods
                    - name
                    - modifiers
                    - return type
                        - type_args...
                    - parameters
                    - position
    """
    def parseFile(self, code: str) -> object:
        res = {}

        try:
            tree = javalang.parse.parse(code)
        except:
            return
        
        res["classes"] = []

        for type_ in tree.types:
            class_ = {}
            class_["className"] = type_.name
            class_["line"] = type_.position[0]
            class_["modifiers"] = [modifier for modifier in type_.modifiers]
            class_["methods"] = []

            for method in type_.methods:

                class_["methods"].append({
                    "methodName": method.name,
                    "modifiers": [modifier for modifier in method.modifiers],
                    "returnType": self.concatenate_type(self.getType(method.return_type)) if method.return_type else "void",
                    "parameters": [{"name": param.name, "type": self.concatenate_type(self.getType(param.type))} for param in method.parameters], 
                    "line": method.position[0]
                })
            
            res["classes"].append(class_)

        return res


    def getType(self, type_):
        c = {}
        
        if type_.name:
            c["name"] = type_.name
            if type_.dimensions:
                c["dimensions"] = type_.dimensions
            try:
                if type_.arguments:
                    c["type_args"] = [self.getType(arg.type) for arg in type_.arguments]
            except AttributeError:
                pass
        else:
            return
        
        return c
    
    # Concatenate type arguments to type in a string format
    def concatenate_type(self, type):
        if type["name"]:
            if "type_args" in type:
                return type["name"] + "<" + ", ".join([self.concatenate_type(arg) for arg in type["type_args"]]) + ">"
            else:
                if "dimensions" in type:
                    return type["name"] + "[]"*len(type["dimensions"])
                else:
                    return type["name"]
        else:
            return


if __name__ == "__main__":
    code = """
    package com.company;

    import java.util.Arrays;
    import java.util.Random;

        public class Main {
	

	private static ArrayList<HashMap<ArrayList<Integer>, Person>> makeArr(int l, HashMap<Integer, String> map) {
		int[] result = new int[l];
		
		for(int i = 0; i < l; i++) {
			result[i] = (int)(Math.random()*100000);
			
		}
			
		return result;
		
		
	}
	

}
    """

    code2 = """
    public class Main {
    
	static int[] makeArr(int l) {
		int[] result = new int[l];
		
		for(int i = 0; i < l; i++) {
			result[i] = (int)(Math.random()*100000);
			
		}
			
		return result;
		
		
	}
	

}
"""
    
    parser = CodeParser(lang="java")
    res = parser.parseFile(code2)
    doc = {
  "url": "http://www.github.com",
  "className": "Sorting",
  "modifiers": ["static", "public"],
  "methods": [
      {
        "methodName": "bubble_Srt",
        "returnType": "int[]",
        "parameters": [
          {"name": "arr", "type": "HashMap"}, {"name": "arr123", "type": "List"}
        ],
        "line": 2,
        "modifiers": ["static", "public"]
      }
  ],
  "line": 2,
}

    elastic = Elastic("8JLfSQS5uM8bYmJrPrRN")
    # elastic.delete("java")
    # elastic.create_index()
    # elastic.index(doc)
    response = elastic.search("className:notSorting OR className:Sorting AND methodName:bubble_Sort OR methodName: merge_sort AND modifiers:static-public")
    print("Response: " + str(response))

    res = parser.parseFile(code)

    # get the line of each method and print the code line from code2
    for class_ in res["classes"]:
        print(class_["methods"][0]["return_type"])
        print(class_["methods"][0]["parameters"])
        # print(class_["name"], class_["modifiers"])
        # for i, line in enumerate(code.splitlines()):
        #     if i >= class_["line"] - 1:
        #         print(line)
        #         break
        
        # for method in class_["methods"]:
        #     for i, line in enumerate(code.splitlines()):
        #         if i >= method["line"] - 1:
        #             print(line)
        #             if i == method["line"] + 4:
        #                 break
