import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('ecosphere_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Handle 401 responses globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ecosphere_user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default API;
