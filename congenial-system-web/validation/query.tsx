const validTypes = [
  "void",
  "byte",
  "short",
  "int",
  "long",
  "float",
  "double",
  "char",
  "boolean",
  "String",
  "Object",
  "int[]",
  "byte[]",
  "char[]",
  "double[]",
  "boolean[]",
  "String[]",
  "Object[]"
];

const validModifiers = [
    "public",
    "private",
    "protected",
    "static",
    "final",
    "synchronized",
    "abstract",
    "default"
]

export function validateModifier(modifier: string): boolean {
    return validModifiers.includes(modifier);
}

export function validateName(name: string): boolean {
    // Do not allow making a query without a methodname
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(name);
}

export function validateType(returnType: string): boolean {
    return validTypes.includes(returnType); 
}

export function validateParameter(type: string, name: string): boolean {
    return validateType(type) && validateName(name);
}
