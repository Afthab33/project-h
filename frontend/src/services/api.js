import axios from 'axios';
import { getAuth } from 'firebase/auth';

// Get the API URL from environment variables
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
console.log('API Service initialized with baseURL:', baseURL);

// Create axios instance
const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  async (config) => {
    try {
      // Get current user from Firebase
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        // Get a fresh token
        const token = await user.getIdToken(true);
        console.log(`Adding auth token to request: ${config.url}`);
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log(`No user logged in for request: ${config.url}`);
      }
      
      return config;
    } catch (error) {
      console.error('Error setting auth token:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access detected');
      // Consider redirecting to login page or refreshing token
    }
    return Promise.reject(error);
  }
);

export default api;