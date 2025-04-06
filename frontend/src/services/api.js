import axios from 'axios';

// Get the API URL from environment variables
const baseURL = import.meta.env.VITE_API_URL;

console.log('API Base URL:', baseURL); // For debugging

const api = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      // Get token from localStorage or auth provider
      const token = localStorage.getItem('authToken');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    } catch (error) {
      console.error('Error in API request interceptor:', error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access detected');
      // Could redirect to login or clear credentials
    }
    return Promise.reject(error);
  }
);

export default api;