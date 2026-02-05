import axios from "axios";
import { auth } from "../firebase";

const client = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Request interceptor - Add user ID to every request
client.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    
    if (user) {
      config.headers["x-user-id"] = user.uid;
      console.log(`🔑 Request with user: ${user.uid}`);
    }
    
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error.message);
    return Promise.reject(error);
  }
);

// Response interceptor
client.interceptors.response.use(
  (response) => {
    console.log(`✅ Response from: ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      fullUrl: error.config?.baseURL + error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    if (error.response?.status === 401) {
      console.error("🔒 Unauthorized - Redirecting to login");
      localStorage.clear();
      window.location.href = "/auth";
    }
    
    return Promise.reject(error);
  }
);

export default client;
