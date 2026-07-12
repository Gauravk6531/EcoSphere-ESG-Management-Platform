import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const client = axios.create({ baseURL });

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err?.response?.data?.detail || err.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

export default client;
