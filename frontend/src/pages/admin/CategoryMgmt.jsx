import React, { useState, useEffect } from 'react';
import categoriesService from '../../services/categories.service';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function CategoryMgmt() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '📋',
    description: '',
    color: 'from-blue-500 to-cyan-500',
    isActive: true,
    order: 0
  });

  // Color options for categories
  const colorOptions = [
    { label: 'Blue-Cyan', value: 'from-blue-500 to-cyan-500' },
    { label: 'Orange-Red', value: 'from-orange-500 to-red-500' },
    { label: 'Yellow-Orange', value: 'from-yellow-500 to-orange-500' },
    { label: 'Purple-Pink', value: 'from-purple-500 to-pink-500' },
    { label: 'Green-Teal', value: 'from-green-500 to-teal-500' },
    { label: 'Indigo-Blue', value: 'from-indigo-500 to-blue-500' },
    { label: 'Amber-Orange', value: 'from-amber-500 to-orange-500' },
    { label: 'Red-Pink', value: 'from-red-500 to-pink-500' },
    { label: 'Cyan-Blue', value: 'from-cyan-500 to-blue-500' },
    { label: 'Violet-Purple', value: 'from-violet-500 to-purple-500' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoriesService.list();
      setCategories(res.data.items || res.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingCategory) {
        await categoriesService.update(editingCategory._id, formData);
      } else {
        await categoriesService.create(formData);
      }
      
      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        icon: '📋',
        description: '',
        color: 'from-blue-500 to-cyan-500',
        isActive: true,
        order: 0
      });
      loadCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
      setError(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      color: category.color,
      isActive: category.isActive,
      order: category.order
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoriesService.delete(id);
      loadCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      setError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      icon: '📋',
      description: '',
      color: 'from-blue-500 to-cyan-500',
      isActive: true,
      order: 0
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-1">Manage service categories</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            Add Category
          </Button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., AC Service & Repair"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., ac-service-repair"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon (Emoji)
                </label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="❄️"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color Gradient
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {colorOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Brief description of the category"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit">
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
              <Button type="button" onClick={handleCancel} variant="secondary">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No categories found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => (
            <div
              key={category._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                  {category.icon}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{category.slug}</p>
              {category.description && (
                <p className="text-sm text-gray-500 mb-3">{category.description}</p>
              )}

              <div className="flex items-center justify-between text-xs">
                <span className={`px-2 py-1 rounded ${category.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-gray-500">Order: {category.order}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
