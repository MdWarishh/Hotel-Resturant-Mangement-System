import axios from 'axios';
// Pehle check karo variable console me kya aa raha hai (Debugging ke liye)
console.log("API URL being used:", process.env.NEXT_PUBLIC_API_URL);
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL;

/**
 * Central Axios Instance
 * Used across the entire frontend
 */
const api = axios.create({
  // API_BASE_URL ||
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor
 * Attaches JWT token from localStorage
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor
 * Handles auth-related errors globally
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401 || status === 403) {
        // Token invalid or expired
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
