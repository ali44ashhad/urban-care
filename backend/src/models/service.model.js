 const mongoose = require('mongoose');
const { Schema } = mongoose;

const PricingOption = new Schema({
  name: String,
  price: Number
}, { _id: false });

const ServiceSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, index: true, unique: true },
  description: String,
  basePrice: Number,
  pricingOptions: [PricingOption],
  durationMin: Number,
  category: String,
  subCategoryId: { type: Schema.Types.ObjectId, ref: 'SubCategory' },
  image: String,
  images: [String],
  rating: { type: Number, default: 0, min: 0, max: 5 },
  reviewCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

ServiceSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Service', ServiceSchema);
