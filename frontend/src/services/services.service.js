/**
 * services.service.js
 * CRUD and listing for services (home cleaning, electrician, etc.)
 *
 * Endpoints assumed:
 * - GET  /services            => list (supports query params)
 * - GET  /services/:id        => get single
 * - POST /services            => create (admin)
 * - PUT  /services/:id        => update (admin)
 * - DELETE /services/:id      => delete (admin)
 */

import api from './apiClient';

const servicesService = {
  list: (params = {}) => api.get('/services', { params }),
  get: (id) => api.get(`/services/${id}`),
  create: (payload) => api.post('/services', payload),
  update: (id, payload) => api.put(`/services/${id}`, payload),
  remove: (id) => api.delete(`/services/${id}`)
};

export default servicesService;
