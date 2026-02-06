import apiClient from './apiClient';

const categoriesService = {
  // Get all categories
  list: async (params = {}) => {
    return apiClient.get('/categories', { params });
  },

  // Get single category by ID
  get: async (id) => {
    return apiClient.get(`/categories/${id}`);
  },

  // Get category by slug (public)
  getBySlug: async (slug) => {
    return apiClient.get(`/categories/by-slug/${encodeURIComponent(slug)}`);
  },

  // List sub-categories for a category by category slug
  listSubcategories: async (categorySlug) => {
    return apiClient.get(`/categories/by-slug/${encodeURIComponent(categorySlug)}/subcategories`);
  },

  // Create new category (admin only)
  create: async (data) => {
    return apiClient.post('/categories', data);
  },

  // Update category (admin only)
  update: async (id, data) => {
    return apiClient.put(`/categories/${id}`, data);
  },

  // Delete category (admin only)
  delete: async (id) => {
    return apiClient.delete(`/categories/${id}`);
  }
};

export default categoriesService;
