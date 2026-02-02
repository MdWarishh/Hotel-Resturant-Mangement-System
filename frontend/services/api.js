import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined') {
    // Agar vercel par ho to Render ka URL return karo
    if (window.location.hostname.includes('vercel.app')) {
      return "https://hotel-resturant-mangement-system.onrender.com";
    }
  }
  return "http://localhost:5000";
};

const api = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor for Token
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;