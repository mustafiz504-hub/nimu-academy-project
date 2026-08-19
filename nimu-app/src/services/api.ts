import axios from "axios";
import { API_BASE_URL } from "../constants/api";
import { storage } from "../utils/storage";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token + fix multipart Content-Type
api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // For FormData (video/image uploads), remove default Content-Type so
  // axios can set 'multipart/form-data' with the correct boundary automatically
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
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
