 const Service = require('../models/service.model');
const Category = require('../models/category.model');
const SubCategory = require('../models/subcategory.model');

// List services (with text search, category, subCategory & pagination)
async function listServices(req, res) {
  const { q, category, subCategory: subCategorySlug, titleContains, page = 1, limit = 20 } = req.query;
  const filter = { isActive: true };
  if (titleContains) {
    filter.title = new RegExp(String(titleContains).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  } else if (q) {
    filter.$text = { $search: q };
  }
  if (category) {
    // When subCategory slug is provided, filter by subCategoryId
    if (subCategorySlug) {
      const cat = await Category.findOne({ $or: [{ name: new RegExp(category, 'i') }, { slug: category }] }).lean();
      if (cat) {
        const sub = await SubCategory.findOne({ categoryId: cat._id, slug: subCategorySlug, isActive: true }).lean();
        if (sub) filter.subCategoryId = sub._id;
        else return res.json({ items: [], page: Number(page) });
      } else {
        filter.category = new RegExp(category, 'i');
      }
    } else {
      // Support both exact match and fuzzy match for category
      filter.category = new RegExp(category, 'i');
    }
  }
  const skip = (page - 1) * limit;
  const items = await Service.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit))
    .lean();
  res.json({ items, page: Number(page) });
}

async function getService(req, res) {
  try {
    const { id } = req.params;
    
    // Try to find by ObjectId first, if it fails or not found, try by slug
    let service;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // Valid ObjectId format
      service = await Service.findById(id);
    }
    
    // If not found or invalid ObjectId, try finding by slug or custom id
    if (!service) {
      service = await Service.findOne({ $or: [{ slug: id }, { _id: id }] });
    }
    
    if (!service) return res.status(404).json({ message: 'Service not found' });
    res.json(service);
  } catch (err) {
    console.error('Get service error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

// Admin: create/update/delete
async function createService(req, res) {
  const payload = req.body;
  
  console.log('Creating service:', {
    title: payload.title,
    category: payload.category,
    basePrice: payload.basePrice,
    hasImage: !!payload.image,
    imageLength: payload.image?.length || 0,
    imagesCount: payload.images?.length || 0
  });
  
  // Auto-generate slug from title if not provided
  if (!payload.slug && payload.title) {
    payload.slug = payload.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  const s = new Service(payload);
  await s.save();
  
  console.log('Service saved:', {
    id: s._id,
    title: s.title,
    slug: s.slug,
    hasImage: !!s.image,
    imagesCount: s.images?.length || 0
  });
  
  res.status(201).json(s);
}
async function updateService(req, res) {
  const { id } = req.params;
  
  // Auto-generate slug from title if not provided
  if (!req.body.slug && req.body.title) {
    req.body.slug = req.body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  const s = await Service.findByIdAndUpdate(id, req.body, { new: true });
  res.json(s);
}
async function deleteService(req, res) {
  const { id } = req.params;
  await Service.findByIdAndDelete(id);
  res.json({ ok: true });
}

module.exports = { listServices, getService, createService, updateService, deleteService };
