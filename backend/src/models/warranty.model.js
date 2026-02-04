 const mongoose = require('mongoose');
const { Schema } = mongoose;

const WarrantySchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User' }, // null if client deleted account
  providerId: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User' },
  issueDetails: String,
  attachmentUrls: { type: [String], default: [] }, // Cloudinary URLs for uploaded attachments
  status: { type: String, enum: ['pending','assigned','in_progress','resolved','rejected'], default: 'pending' },
  adminNotes: String,
  resolutionNotes: String,
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Warranty', WarrantySchema);
