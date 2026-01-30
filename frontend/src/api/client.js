import axios from "axios";
import { auth } from "../firebase";

// Create axios instance
const client = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

// Add auth interceptor
client.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    if (user) {
      // Add Firebase user ID to headers
      config.headers["x-user-id"] = user.uid;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Unauthorized access");
    }
    return Promise.reject(error);
  }
);

export default client;
