/**
 * notifications.service.js
 * Basic notifications API.
 *
 * - GET  /notifications           -> list (unread first)
 * - POST /notifications/mark-read -> mark read single or batch
 * - POST /notifications/send      -> admin or system send custom notification
 */

import api from './apiClient';

const notificationsService = {
  list: (params = {}) => api.get('/notifications', { params }),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
  send: (payload) => api.post('/notifications', payload) // admin/system
};

export default notificationsService;
