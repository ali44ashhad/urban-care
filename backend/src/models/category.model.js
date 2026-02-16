const mongoose = require('mongoose');
const { Schema } = mongoose;

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  icon: { type: String, default: '📋' }, // Emoji icon
  description: { type: String, default: '' },
  color: { type: String, default: 'from-blue-500 to-cyan-500' }, // Tailwind gradient
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 } // For sorting categories
}, { timestamps: true });

CategorySchema.index({ isActive: 1, order: 1 });
CategorySchema.index({ slug: 1, isActive: 1 }); // fast lookup by slug in listSubcategoriesBySlug

module.exports = mongoose.model('Category', CategorySchema);
