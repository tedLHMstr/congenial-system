import axios from "axios";

const PORT = 8000;
const BASE_URL = `http://localhost:${PORT}`;

/* Types */
import { MethodResponse, QueryResponse } from "@/types/Types.types";

export async function query(query_string: string): Promise<QueryResponse> {
    const url = `${BASE_URL}/search?query=${encodeURIComponent(query_string)}`;
    const response = await axios.get<QueryResponse>(url);

    return response.data;
}

export async function queryMethod(query_string: string): Promise<MethodResponse> {
    const url = `${BASE_URL}/searchMethod?query=${encodeURIComponent(query_string)}`;
    const response = await axios.get<MethodResponse>(url);

    return response.data;
}

export async function queryClass(query_string: string): Promise<MethodResponse> {
    const url = `${BASE_URL}/searchClass?query=${encodeURIComponent(query_string)}`;
    const response = await axios.get<MethodResponse>(url);

    return response.data;
}
