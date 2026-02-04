/**
 * bookings.service.js
 * Booking lifecycle operations for clients/providers/admin.
 *
 * Expected endpoints:
 * - POST /bookings                 -> create booking (client)
 * - GET  /bookings?role=client     -> list bookings (filters via query)
 * - GET  /bookings/:id             -> booking detail
 * - POST /bookings/:id/accept
 * - POST /bookings/:id/reject
 * - POST /bookings/:id/cancel
 * - POST /bookings/:id/complete
 * - POST /bookings/:id/warranty    -> attach warranty (or separate warranty endpoint)
 */

import api from './apiClient';

const bookingsService = {
  create: (payload) => api.post('/bookings', payload),
  list: (params = {}) => api.get('/bookings', { params }),
  get: (id) => api.get(`/bookings/${id}`),
  getById: (id) => api.get(`/bookings/${id}`),

  // provider actions
  accept: (id) => api.post(`/bookings/${id}/accept`),
  acceptBooking: (id) => api.post(`/bookings/${id}/accept`),
  reject: (id, reason) => api.post(`/bookings/${id}/reject`, { reason }),
  rejectBooking: (id, reason) => api.post(`/bookings/${id}/reject`, { reason }),
  cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
  markInProgress: (id) => api.post(`/bookings/${id}/in_progress`),
  startJob: (id) => api.post(`/bookings/${id}/in_progress`),
  complete: (id, data) => api.post(`/bookings/${id}/complete`, data),
  completeJob: (id, data) => api.post(`/bookings/${id}/complete`, data),
  
  // warranty slip upload
  uploadWarrantySlip: (id, formData) => api.post(`/bookings/${id}/warranty-slip`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),

  // admin actions
  assignProvider: (bookingId, providerId) => api.post(`/bookings/${bookingId}/assign`, { providerId }),

  // extra services (provider adds at client site, client confirms)
  addExtraService: (bookingId, payload) => api.post(`/bookings/${bookingId}/extra-services`, payload),
  confirmExtraServices: (bookingId) => api.post(`/bookings/${bookingId}/extra-services/confirm`),
  
  // get bookings by provider
  getProviderBookings: (providerId, params = {}) => api.get('/bookings', { params: { ...params, providerId } }),

  // search / analytics
  stats: (params) => api.get('/bookings/stats', { params })
};

export default bookingsService;
