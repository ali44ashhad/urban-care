/**
 * warranty.service.js
 * Warranty claims and lifecycle.
 *
 * - POST /warranty                -> create claim (multipart/form-data supported)
 * - GET  /warranty               -> list all claims (admin only)
 * - GET  /warranty/client        -> list client's claims
 * - GET  /warranty/agent         -> list assigned claims (provider only)
 * - GET  /warranty/:id           -> get claim
 * - PATCH /warranty/:id/admin    -> admin update (assign/reject/resolve)
 * - PATCH /warranty/:id/agent    -> agent update status
 *
 * Note: create() supports FormData to upload attachments.
 */

import api from './apiClient';

const warrantyService = {
  create: (payload) => {
    // payload can be FormData (recommended if attachments present)
    // If payload is plain object, the backend should accept JSON
    if (payload instanceof FormData) {
      return api.post('/warranty', payload, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    return api.post('/warranty', payload);
  },

  list: (params = {}) => api.get('/warranty', { params }), // Admin: all warranties
  listForClient: (params = {}) => api.get('/warranty/client', { params }), // Client: their warranties
  listForAgent: (params = {}) => api.get('/warranty/agent', { params }), // Provider: assigned warranties only
  get: (id) => api.get(`/warranty/${id}`),
  
  // Admin actions
  adminUpdate: (id, data) => api.patch(`/warranty/${id}/admin`, data),
  assignAgent: (id, agentId) => api.patch(`/warranty/${id}/admin`, { action: 'assign', assignedAgentId: agentId }),
  
  // Agent actions
  agentUpdate: (id, data) => api.patch(`/warranty/${id}/agent`, data),
  updateStatus: (id, status, resolutionNotes) => api.patch(`/warranty/${id}/agent`, { status, resolutionNotes })
};

export default warrantyService;
