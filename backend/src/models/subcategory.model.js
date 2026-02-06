const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * SubCategory - belongs to a Category (e.g. AC → Gas Filling, AC Filters)
 * slug is unique within a category
 */
const SubCategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, lowercase: true, trim: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

SubCategorySchema.index({ categoryId: 1, slug: 1 }, { unique: true });
SubCategorySchema.index({ categoryId: 1, order: 1 });

module.exports = mongoose.model('SubCategory', SubCategorySchema);
