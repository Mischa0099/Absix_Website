// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request for debugging
    console.log('🔗 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasAuth: !!token
    });
    
    return config;
  },
  (error) => {
    console.error('🔗 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token expiration
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config?.url,
      method: response.config?.method?.toUpperCase()
    });
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      message: error.response?.data?.detail || error.message
    });

    // Handle unauthorized access
    if (error.response?.status === 401) {
      console.log('🔐 Unauthorized access, clearing auth data');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on home page
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// =================================================================