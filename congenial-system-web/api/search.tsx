import axios from "axios";

const PORT = 8000;
const BASE_URL = `http://localhost:${PORT}`;

interface QueryResponse {
    message: string;
}

export async function query(query_string: string): Promise<QueryResponse> {
    const url = `${BASE_URL}/search?query=${encodeURIComponent(query_string)}`;
    const response = await axios.get<QueryResponse>(url);

    console.log("RESPONSE", response.data);

    return response.data;
}
