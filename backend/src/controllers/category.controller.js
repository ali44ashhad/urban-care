const Category = require('../models/category.model');
const SubCategory = require('../models/subcategory.model');

// List all categories with optional filtering
async function listCategories(req, res) {
  try {
    const { isActive, search, page = 1, limit = 50 } = req.query;
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { slug: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') }
      ];
    }
    
    const skip = (page - 1) * limit;
    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();
    
    const total = await Category.countDocuments(filter);
    
    res.json({
      items: categories,
      total,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (err) {
    console.error('List categories error:', err);
    res.status(500).json({ message: 'Failed to fetch categories', error: err.message });
  }
}

// Get single category by ID
async function getCategory(req, res) {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json(category);
  } catch (err) {
    console.error('Get category error:', err);
    res.status(500).json({ message: 'Failed to fetch category', error: err.message });
  }
}

// Get category by slug (public)
async function getCategoryBySlug(req, res) {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true }).lean();
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error('Get category by slug error:', err);
    res.status(500).json({ message: 'Failed to fetch category', error: err.message });
  }
}

// List sub-categories for a category (by category slug)
async function listSubcategoriesBySlug(req, res) {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug, isActive: true }).lean();
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    const subcategories = await SubCategory.find({ categoryId: category._id, isActive: true })
      .sort({ order: 1, name: 1 })
      .lean();
    res.json({ items: subcategories, category });
  } catch (err) {
    console.error('List subcategories error:', err);
    res.status(500).json({ message: 'Failed to fetch subcategories', error: err.message });
  }
}

// Create new category
async function createCategory(req, res) {
  try {
    const { name, slug, icon, description, color, isActive, order } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }
    
    // Auto-generate slug if not provided
    // Handle spaces, ampersands, and all special characters properly
    const categorySlug = slug || name
      .toLowerCase()
      .trim()
      .replace(/[&\s]+/g, '-')  // Replace spaces and ampersands with hyphens
      .replace(/[^a-z0-9-]+/g, '-')  // Replace other special chars with hyphens
      .replace(/-+/g, '-')  // Replace multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, '');  // Remove leading/trailing hyphens
    
    // Check if category with same name or slug already exists
    const existing = await Category.findOne({
      $or: [{ name }, { slug: categorySlug }]
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Category with this name or slug already exists' });
    }
    
    const category = new Category({
      name,
      slug: categorySlug,
      icon: icon || '📋',
      description: description || '',
      color: color || 'from-blue-500 to-cyan-500',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0
    });
    
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    console.error('Create category error:', err);
    res.status(500).json({ message: 'Failed to create category', error: err.message });
  }
}

// Update existing category
async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, icon, description, color, isActive, order } = req.body;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    // Check if new name/slug conflicts with another category
    if (name || slug) {
      const existing = await Category.findOne({
        _id: { $ne: id },
        $or: [
          ...(name ? [{ name }] : []),
          ...(slug ? [{ slug }] : [])
        ]
      });
      
      if (existing) {
        return res.status(400).json({ message: 'Category with this name or slug already exists' });
      }
    }
    
    if (name !== undefined) {
      category.name = name;
      // Auto-update slug if name changed and slug wasn't explicitly provided
      if (!slug) {
        category.slug = name
          .toLowerCase()
          .trim()
          .replace(/[&\s]+/g, '-')
          .replace(/[^a-z0-9-]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
    }
    if (slug !== undefined) {
      // Sanitize the slug even if provided manually
      category.slug = slug
        .toLowerCase()
        .trim()
        .replace(/[&\s]+/g, '-')
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
    }
    if (icon !== undefined) category.icon = icon;
    if (description !== undefined) category.description = description;
    if (color !== undefined) category.color = color;
    if (isActive !== undefined) category.isActive = isActive;
    if (order !== undefined) category.order = order;
    
    await category.save();
    res.json(category);
  } catch (err) {
    console.error('Update category error:', err);
    res.status(500).json({ message: 'Failed to update category', error: err.message });
  }
}

// Delete category
async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error('Delete category error:', err);
    res.status(500).json({ message: 'Failed to delete category', error: err.message });
  }
}

module.exports = {
  listCategories,
  getCategory,
  getCategoryBySlug,
  listSubcategoriesBySlug,
  createCategory,
  updateCategory,
  deleteCategory
};
