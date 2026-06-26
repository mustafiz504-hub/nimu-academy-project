import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clearAll();
      // Navigation to login should be handled by AuthNavigator watching auth state
    }
    return Promise.reject(error);
  }
);

export default api;
