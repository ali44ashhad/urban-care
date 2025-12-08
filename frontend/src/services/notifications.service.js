/**
 * notifications.service.js
 * Basic notifications API.
 *
 * - GET  /notifications           -> list (unread first)
 * - PUT  /notifications/:id/read  -> mark single notification as read
 * - PUT  /notifications/read-all  -> mark all notifications as read
 * - DELETE /notifications/:id     -> delete notification
 */

import api from './apiClient';

const notificationsService = {
  list: (params = {}) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`)
};

export default notificationsService;
