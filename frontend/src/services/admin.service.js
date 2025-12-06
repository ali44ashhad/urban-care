 /**
 * admin.service.js
 * Admin helper endpoints: analytics, bulk actions, system-level tasks.
 *
 * This file contains convenience wrappers that don't fit elsewhere.
 * Expected endpoints (examples):
 * - GET /admin/analytics
 * - GET /admin/revenue
 * - POST /admin/seed (optional)
 */

import api from './apiClient';

const adminService = {
  analytics: (params) => api.get('/admin/analytics', { params }),
  revenue: (params) => api.get('/admin/revenue', { params }),
  bookingsReport: (params) => api.get('/admin/bookings-report', { params }),

  // User management
  listUsers: (params) => api.get('/admin/users', { params }),
  toggleUserStatus: (userId, isActive) => api.patch(`/admin/users/${userId}/status`, { isActive }),

  // Pending requests and agent assignment
  getPendingRequests: (params) => api.get('/admin/pending-requests', { params }),
  getServiceAgents: () => api.get('/admin/service-agents'),

  // Warranty claims management
  listWarrantyClaims: (params) => api.get('/admin/warranty-claims', { params }),
  updateWarranty: (warrantyId, data) => api.put(`/warranty/${warrantyId}/admin`, data),
  assignWarrantyAgent: (warrantyId, agentId) => api.put(`/warranty/${warrantyId}/admin`, { assignedAgentId: agentId, status: 'assigned' }),

  // Bulk delete reviews / bookings (be careful)
  bulkDelete: (entity, ids) => api.post(`/admin/${entity}/bulk-delete`, { ids }),

  // simple health ping
  ping: () => api.get('/admin/ping')
};

export default adminService;
