import api from './apiClient';

const subcategoriesService = {
  listByCategory: (categoryId) => api.get('/subcategories', { params: { categoryId } }),
  create: (data) => api.post('/subcategories', data),
  update: (id, data) => api.put(`/subcategories/${id}`, data),
  delete: (id) => api.delete(`/subcategories/${id}`)
};

export default subcategoriesService;
