 const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * BOOKING MODEL
 * 
 * WORKFLOW:
 * 1. Client creates booking → status='pending', providerId=null
 * 2. Admin assigns service agent → providerId=User._id (where role='provider')
 * 3. Provider accepts → status='accepted'
 * 4. Provider starts work → status='in_progress'
 * 5. Provider completes & u ploads warranty slip → status='completed', warrantyExpiresAt set
 * 6. Client can claim warranty within 14 days if needed
 */

const SlotSchema = new Schema({
  date: { type: Date, required: true },
  startTime: String,
  endTime: String
}, { _id: false });

const AddressSchema = new Schema({
  label: String,
  line1: String,
  city: String,
  state: String,
  pincode: String,
  lat: Number,
  lng: Number
}, { _id: false });

const BookingSchema = new Schema({
  clientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  providerId: { type: Schema.Types.ObjectId, ref: 'User' }, // Service Agent assigned by admin
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  price: Number,
  slot: SlotSchema,
  address: AddressSchema,
  status: { type: String, enum: ['pending','accepted','rejected','cancelled','in_progress','completed','warranty_requested','warranty_claimed'], default: 'pending', index: true },
  cancelReason: String,
  warrantyRequests: [{ type: Schema.Types.ObjectId, ref: 'Warranty' }],
  paymentRef: String,
  paymentMethod: { type: String, enum: ['POD', 'ONLINE'], default: 'POD' },
  warrantySlip: { type: String }, // URL to uploaded warranty slip (uploaded by provider after completion)
  warrantyExpiresAt: { type: Date }, // 14 days from completion (set when status→completed)
  completedAt: { type: Date } // Track completion timestamp
}, { timestamps: true });

BookingSchema.index({ clientId: 1, status: 1 });
BookingSchema.index({ providerId: 1, status: 1 });
BookingSchema.index({ 'slot.date': 1 });

module.exports = mongoose.model('Booking', BookingSchema);
