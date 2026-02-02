import axios from 'axios';
// Pehle check karo variable console me kya aa raha hai (Debugging ke liye)
// Yeh function decide karega ki API URL kya hoga
const RENDER_URL = "https://hotel-resturant-mangement-system.onrender.com";

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Agar localhost nahi hai, toh seedha Render URL return karo
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      return RENDER_URL;
    }
  }
  // Local development ke liye
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: getBaseURL(),
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
