export type Method = {
    methodName: string,
    returnType: string,
    parameters: {
        name: string,
        type: string
    }[],
    modifiers: string[]
    line: number,
    url: string,
    download_url: string,
}

export interface Class {
    className: string,
    methods: string[],
    line: number,
    url: string,
    download_url: string,
    modifiers: string[]
}

// export type DocResult = {
//     _score: number,
//     _id: string,
//     _source: {
//         url: string,
//         download_url: string,
//         className: string,
//         line: number,
//         modifiers: string[],
//         methods: Method[]
//     }
// }

export type DocResult = {
    _score: number,
    _id: string,
    _source: Method | Class
}

export type QueryResponse = {
    hits: {
        hits: DocResult[];
        total: {
            value: number;
            relation: string;
        }
    }
}

export type MethodResponse = {
    hits: {
        hits: DocResult[];
        total: {
            value: number;
            relation: string;
        }
    }
}

export type ClassResponse = {
    hits: {
        hits: DocResult[];
        total: {
            value: number;
            relation: string;
        }
    }
}