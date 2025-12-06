 const mongoose = require('mongoose');
const { Schema } = mongoose;

const NotificationSchema = new Schema({
  toUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  type: String,
  payload: Schema.Types.Mixed,
  channel: String, // email, sms, push
  status: { type: String, enum: ['queued','sent','failed'], default: 'queued' },
  attempts: { type: Number, default: 0 },
  sentAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Notification', NotificationSchema);
