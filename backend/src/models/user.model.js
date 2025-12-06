 const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * USER MODEL - Central authentication and profile model
 * 
 * ROLES:
 * 1. 'client' - Customer who books services
 * 2. 'provider' - Service Agent/Technician who performs the work (AC repair technician)
 * 3. 'admin' - Admin who manages bookings, assigns agents, handles warranty claims
 * 
 * IMPORTANT: 
 * - Provider (Service Agent) information is stored HERE, not in separate Provider model
 * - Booking.providerId references User._id where role='provider'
 * - Admin assigns providerId when approving pending bookings
 */

const ProviderProfile = new Schema({
  companyName: String,
  servicesOffered: [{ type: Schema.Types.ObjectId, ref: 'Service' }],
  address: {
    line1: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number
  },
  experienceYears: Number,
  docs: [{ type: { type: String }, url: String }],
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  bankDetailsRef: { type: String }
}, { _id: false });

const ClientProfile = new Schema({
  addresses: [{
    label: String,
    line1: String,
    city: String,
    state: String,
    pincode: String,
    lat: Number,
    lng: Number
  }]
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true },
  companyName: { type: String }, // For providers/service agents
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['client', 'provider', 'admin'], required: true },
  phone: { type: String, index: true },
  bio: { type: String },
  avatar: { type: String },
  address: {
    addressLine: String,
    city: String,
    state: String,
    pincode: String
  },
  isActive: { type: Boolean, default: true },
  profile: { type: Schema.Types.Mixed },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
