export type Method = {
    methodName: string,
    returnType: string,
    parameters: {
        name: string,
        type: string
    }[],
    modifiers: string[]
    line: number
}

export type DocResult = {
    _score: number,
    _id: string,
    _source: {
        url: string,
        download_url: string,
        className: string,
        line: number,
        modifiers: string[],
        methods: Method[]
    }
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