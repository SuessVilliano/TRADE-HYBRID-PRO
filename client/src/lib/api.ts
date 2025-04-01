import axios from 'axios';

// Create an axios instance with common configuration
export const api = axios.create({
  baseURL: '/', // Base URL for the API (relative to the current host)
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor for authentication tokens
api.interceptors.request.use((config) => {
  // Get the token from localStorage or wherever it's stored
  const token = localStorage.getItem('auth_token');
  
  // If token exists, add it to the headers
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use((response) => {
  // Any status code within the range of 2xx causes this function to trigger
  return response;
}, (error) => {
  // Any status codes outside the range of 2xx cause this function to trigger
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API Error Response:', error.response.data);
    
    // Handle authentication errors
    if (error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API No Response:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API Error:', error.message);
  }
  
  return Promise.reject(error);
});