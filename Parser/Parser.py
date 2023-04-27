import javalang

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
                - documentation
                - methods
                    - name
                    - modifiers
                    - return type
                        - type_args...
                    - parameters
                    - documentation
                    - position
    """
    def parseFile(self, code: str) -> object:
        res = {}

        tree = javalang.parse.parse(code)

        res["package"] = tree.package.name if tree.package else None
        res["imports"] = [imp.path for imp in tree.imports]
        res["classes"] = []

        for type_ in tree.types:
            class_ = {}
            class_["name"] = type_.name
            class_["documentation"] = type_.documentation
            class_["methods"] = []

            for method in type_.methods:

                class_["methods"].append({
                    "name": method.name,
                    "modifiers": [modifier for modifier in method.modifiers],
                    "return_type": self.getType(method.return_type) if method.return_type else "void",
                    "parameters": [{"name": param.name, "type": self.getType(param.type)} for param in method.parameters], 
                    "documentation": method.documentation,
                    "position": method.position
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


if __name__ == "__main__":
    code = """
    package com.company;

    import java.util.Arrays;
    import java.util.Random;

        public class Main {
	

	private static ArrayList<HashMap<Integer, ArrayList<String>>> makeArr(int l, HashMap<Integer, String> map) {
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
    res = parser.parseFile(code)

    # get the line of each method and print the code line from code2
    for class_ in res["classes"]:
        for method in class_["methods"]:
            for i, line in enumerate(code.splitlines()):
                if i >= method["position"][0] - 1:
                    print(line)
                    if i == method["position"][0] + 4:
                        break
