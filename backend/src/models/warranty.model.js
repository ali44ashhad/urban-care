 const mongoose = require('mongoose');
const { Schema } = mongoose;

const WarrantySchema = new Schema({
  bookingId: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User' },
  assignedAgentId: { type: Schema.Types.ObjectId, ref: 'User' }, // Agent assigned to handle warranty claim
  issueDetails: String,
  status: { type: String, enum: ['pending','assigned','in_progress','resolved','rejected'], default: 'pending' },
  adminNotes: String,
  resolutionNotes: String, // Notes from agent after resolving
  resolvedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Warranty', WarrantySchema);
