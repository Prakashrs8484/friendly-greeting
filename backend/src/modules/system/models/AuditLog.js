const mongoose = require('mongoose');
const AuditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actionId: String,
  type: String,
  payload: Object,
  appliedAt: { type: Date, default: Date.now },
  appliedBy: { type: String, default: 'system' },
  notes: String
});
module.exports = mongoose.model('AuditLog', AuditLogSchema);
