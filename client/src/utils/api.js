import axios from 'axios';
import { API_CONFIG } from '../config/environment';
import Logger from './logger';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Logger.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(`${API_CONFIG.baseURL}/auth/refresh`, {
          refreshToken,
        });
        const { token } = response.data;
        localStorage.setItem('auth_token', token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        Logger.error('Token refresh failed:', refreshError);
        // Clear auth state and redirect to login
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      if (retryAfter) {
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        return api(originalRequest);
      }
    }

    // Log error details
    Logger.error('API Error:', {
      url: originalRequest.url,
      method: originalRequest.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    return Promise.reject(error);
  }
);

// Retry mechanism for failed requests
const retryRequest = async (fn, retries = API_CONFIG.retryAttempts) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && !error.response?.status?.toString().startsWith('4')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return retryRequest(fn, retries - 1);
    }
    throw error;
  }
};

// API methods with retry logic
export const apiClient = {
  get: (url, config) => retryRequest(() => api.get(url, config)),
  post: (url, data, config) => retryRequest(() => api.post(url, data, config)),
  put: (url, data, config) => retryRequest(() => api.put(url, data, config)),
  delete: (url, config) => retryRequest(() => api.delete(url, config)),
  patch: (url, data, config) => retryRequest(() => api.patch(url, data, config)),
};

export default apiClient; 