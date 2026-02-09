const mongoose = require('mongoose');

const agentPageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  icon: { type: String, default: '' },
  ownerId: { type: String, required: true }, // Owner's user ID
  pageConfig: { type: Object, default: {} }, // Page-level configuration (JSON)
  agents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }], // References to agents
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AgentPage', agentPageSchema);
