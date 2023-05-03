import axios from "axios";

const PORT = 8000;
const BASE_URL = `http://localhost:${PORT}`;

/* Types */
import { QueryResponse } from "@/types/Types.types";

export async function query(query_string: string): Promise<QueryResponse> {
    const url = `${BASE_URL}/search?query=${encodeURIComponent(query_string)}`;
    const response = await axios.get<QueryResponse>(url);

    return response.data;
}
