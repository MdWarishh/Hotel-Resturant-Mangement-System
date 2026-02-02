import axios from 'axios';
// Render ka live link
const LIVE_BACKEND_URL = "https://hotel-resturant-mangement-system.onrender.com";

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Agar URL me vercel.app hai, to bina soche Render use karo
    if (window.location.hostname.includes('vercel.app')) {
      return LIVE_BACKEND_URL;
    }
    // Agar localhost nahi hai (jaise ki custom domain), to bhi Render use karo
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return LIVE_BACKEND_URL;
    }
  }
  return "http://localhost:5000"; // Local ke liye default
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
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
