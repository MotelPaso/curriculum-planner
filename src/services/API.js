import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const BACKEND = axios.create({
	baseURL: API_URL,
});
export default BACKEND;
