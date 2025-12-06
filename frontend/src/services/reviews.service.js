/**
 * reviews.service.js
 * CRUD for reviews & rating moderation.
 *
 * Endpoints:
 * - POST /reviews            -> create (client)
 * - GET  /reviews            -> list (params: serviceId, providerId, limit, page)
 * - PUT  /reviews/:id        -> edit (client/admin)
 * - DELETE /reviews/:id      -> delete (admin)
 * - PATCH /reviews/:id/approve -> admin approve
 * - DELETE /reviews/:id/reject  -> admin reject/remove
 */

import api from './apiClient';

const reviewsService = {
  create: (payload) => api.post('/reviews', payload),
  list: (params = {}) => api.get('/reviews', { params }),
  listByService: (serviceId) => api.get('/reviews', { params: { serviceId, isApproved: true } }),
  get: (id) => api.get(`/reviews/${id}`),
  update: (id, payload) => api.put(`/reviews/${id}`, payload),
  remove: (id) => api.delete(`/reviews/${id}`),
  approve: (id) => api.patch(`/reviews/${id}/approve`),
  reject: (id) => api.delete(`/reviews/${id}/reject`)
};

export default reviewsService;
