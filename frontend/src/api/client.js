import axios from 'axios';

let rawBase = import.meta.env.VITE_API_BASE_URL;
if (!rawBase) {
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    rawBase = 'http://localhost:8080';
  } else {
    rawBase = '';
  }
}

const API_BASE_URL = !rawBase 
  ? '/api' 
  : rawBase.endsWith('/api') 
    ? rawBase 
    : `${rawBase.replace(/\/+$/, '')}/api`;

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('brunoverse_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token on 401 if not on login or register
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        localStorage.removeItem('brunoverse_token');
        localStorage.removeItem('brunoverse_user');
      }
    }
    return Promise.reject(error);
  }
);

export default client;
