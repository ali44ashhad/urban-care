 const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReviewSchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, min: 1, max: 5 },
  title: String,
  comment: String,
  isApproved: { type: Boolean, default: false }
}, { timestamps: true });

ReviewSchema.index({ providerId: 1, rating: -1 });

module.exports = mongoose.model('Review', ReviewSchema);
