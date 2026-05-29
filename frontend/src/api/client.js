import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api')
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('miniCrmToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 (invalid/expired token)
    if (error.response?.status === 401) {
      localStorage.removeItem('miniCrmToken');
      localStorage.removeItem('miniCrmUser');
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function getApiError(error) {
  return error.response?.data?.message || error.message || 'Something went wrong';
}
