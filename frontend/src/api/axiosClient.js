import axios from 'axios';

// Base URL points to /api (proxied by Vite) or an environment variable
const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT Bearer token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('spms_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle common errors and normalize responses
axiosClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;
    
    // Auto logout on 401 Unauthorized if not on the login request itself
    if (error.response?.status === 401 && !originalRequest.url?.includes('/login')) {
      localStorage.removeItem('spms_token');
      localStorage.removeItem('spms_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=1';
      }
    }

    // Extract standardized API error message from SPMS ApiResponse
    let message = 'An unexpected error occurred';
    let errors = [];

    if (error.response?.data) {
      const data = error.response.data;
      if (typeof data === 'string') {
        message = data;
      } else if (data.message) {
        message = data.message;
      }
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        errors = data.errors;
        message = errors[0]; // Highlight first validation error
      }
    } else if (error.message) {
      message = error.message;
    }

    return Promise.reject({
      status: error.response?.status,
      message,
      errors,
      raw: error,
    });
  }
);

export default axiosClient;

