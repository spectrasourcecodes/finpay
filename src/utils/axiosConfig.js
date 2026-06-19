import axios from 'axios';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    // Try to get token from localStorage (check both user and admin)
    let token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    
    // For admin routes, prefer admin token
    if (config.url?.includes('/admin')) {
      token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token expiration
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if it's an authentication error
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      
      // If it's an admin route, clear admin token
      if (url.includes('/admin')) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        // Only redirect if we're on an admin page
        if (window.location.pathname.includes('/admin')) {
          window.location.href = '/admin-login';
        }
      } else {
        // Clear user token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Only redirect if we're on a user page
        if (!window.location.pathname.includes('/admin')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;