const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  actionId: { type: String, required: true },
  type: { type: String, required: true },
  payload: { type: Object, default: {} },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
