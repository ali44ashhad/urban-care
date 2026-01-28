/**
 * auth.service.js
 * Authentication service - handles login, register, logout
 *
 * Endpoints:
 * - POST /auth/register       => register new user
 * - POST /auth/login          => login user
 */

import api from './apiClient';

const authService = {
  register: (payload) => api.post('/auth/register', payload),
  verifyRegistration: (payload) => api.post('/auth/register/verify', payload),
  login: (payload) => api.post('/auth/login', payload), // Now accepts { phone } instead of { email, password }
  verifyLogin: (payload) => api.post('/auth/login/verify', payload), // Now accepts { phone, code, userId? }
  resendOTP: (payload) => api.post('/auth/resend-otp', payload),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (payload) => api.put('/auth/profile', payload),
  changePassword: (payload) => api.post('/auth/change-password', payload),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  logout: () => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  },
  setToken: (token) => {
    localStorage.setItem('token', token);
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }
};

export default authService;
