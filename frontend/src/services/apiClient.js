/**
 * apiClient.js
 * - Central axios instance used by all service modules.
 * - Attaches Authorization header from cookies token automatically.
 * - Exposes helper to set/clear token programmatically.
 * - Basic response error normalization.
 *
 * IMPORTANT:
 * - Set VITE_API_BASE_URL in your .env for production/staging e.g. VITE_API_BASE_URL=https://api.yourdomain.com
 */

import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Accept': 'application/json'
  }
});

// Attach token from cookies if present
function attachTokenFromStorage() {
  const token = Cookies.get('token');
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
}
attachTokenFromStorage();

// Allow other modules to set/clear token safely
export function setAuthToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    Cookies.set('token', token, { expires: 30 }); // 30 days
  } else {
    delete api.defaults.headers.common.Authorization;
    Cookies.remove('token');
  }
}

// Response interceptor to normalize errors
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API Error:', err);
    
    // Handle 401 Unauthorized - clear invalid tokens
    if (err.response?.status === 401) {
      console.warn('401 Unauthorized - clearing stale auth tokens');
      delete api.defaults.headers.common.Authorization;
      Cookies.remove('token');
      localStorage.removeItem('user');
      // Optionally redirect to login
      // window.location.href = '/auth/login';
    }
    
    // Normalize axios error shape
    if (err.response) {
      // Server responded with non-2xx
      const normalized = new Error(err.response.data?.message || err.response.statusText || 'Server error');
      normalized.status = err.response.status;
      normalized.data = err.response.data;
      normalized.response = err.response;
      return Promise.reject(normalized);
    }
    if (err.request) {
      const e = new Error('Cannot connect to server. Please check if backend is running.');
      e.code = 'NO_RESPONSE';
      return Promise.reject(e);
    }
    return Promise.reject(err);
  }
);

export default api;
