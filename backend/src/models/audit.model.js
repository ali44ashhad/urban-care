 // src/models/audit.model.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const AuditSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  action: String,
  resourceType: String,
  resourceId: Schema.Types.Mixed,
  meta: Schema.Types.Mixed,
  ip: String
}, { timestamps: true });

module.exports = mongoose.model('Audit', AuditSchema);
