import axios from 'axios';
import { showToast } from '@components/ui/Toast';
import { Clerk } from '@clerk/clerk-js';

const api = axios.create({
  baseURL: '/api/v1',
});

api.interceptors.request.use(async (config) => {
  const token = await Clerk.session?.getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    showToast({ message, type: 'error' });
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Optionally handle auth errors globally
    }
    return Promise.reject(error);
  }
);

export default api;



