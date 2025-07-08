import axios from "axios";

export const BASE_URL = "http://localhost:3001";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
