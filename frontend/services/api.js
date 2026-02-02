import axios from 'axios';

const api = axios.create({
  // Direct hardcode Render URL for live, localhost for dev
  baseURL: typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? "https://hotel-resturant-mangement-system.onrender.com"
    : "http://localhost:5000",
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
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