const SubCategory = require('../models/subcategory.model');

function slugify(name) {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[&\s]+/g, '-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function createSubcategory(req, res) {
  try {
    const { categoryId, name, slug, order, isActive } = req.body;
    if (!categoryId || !name) {
      return res.status(400).json({ message: 'categoryId and name are required' });
    }
    const subSlug = slug || slugify(name);
    const existing = await SubCategory.findOne({ categoryId, slug: subSlug });
    if (existing) {
      return res.status(400).json({ message: 'Sub-category with this slug already exists in this category' });
    }
    const sub = new SubCategory({
      categoryId,
      name,
      slug: subSlug,
      order: order ?? 0,
      isActive: isActive !== undefined ? isActive : true
    });
    await sub.save();
    res.status(201).json(sub);
  } catch (err) {
    console.error('Create subcategory error:', err);
    res.status(500).json({ message: 'Failed to create subcategory', error: err.message });
  }
}

async function updateSubcategory(req, res) {
  try {
    const { id } = req.params;
    const { name, slug, order, isActive } = req.body;
    const sub = await SubCategory.findById(id);
    if (!sub) return res.status(404).json({ message: 'Sub-category not found' });
    if (name !== undefined) sub.name = name;
    if (slug !== undefined) sub.slug = slugify(slug) || sub.slug;
    if (order !== undefined) sub.order = order;
    if (isActive !== undefined) sub.isActive = isActive;
    await sub.save();
    res.json(sub);
  } catch (err) {
    console.error('Update subcategory error:', err);
    res.status(500).json({ message: 'Failed to update subcategory', error: err.message });
  }
}

async function deleteSubcategory(req, res) {
  try {
    const { id } = req.params;
    const sub = await SubCategory.findByIdAndDelete(id);
    if (!sub) return res.status(404).json({ message: 'Sub-category not found' });
    res.json({ message: 'Sub-category deleted' });
  } catch (err) {
    console.error('Delete subcategory error:', err);
    res.status(500).json({ message: 'Failed to delete subcategory', error: err.message });
  }
}

async function listByCategory(req, res) {
  try {
    const { categoryId } = req.query;
    if (!categoryId) {
      return res.status(400).json({ message: 'categoryId is required' });
    }
    const items = await SubCategory.find({ categoryId }).sort({ order: 1, name: 1 });
    res.json({ items });
  } catch (err) {
    console.error('List subcategories error:', err);
    res.status(500).json({ message: 'Failed to list subcategories', error: err.message });
  }
}

module.exports = {
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  listByCategory
};
