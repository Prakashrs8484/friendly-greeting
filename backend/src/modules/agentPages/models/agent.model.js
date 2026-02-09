const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
  pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'AgentPage', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  config: { type: Object, default: {} }, // Agent configuration (prompts, settings, etc.)
  // Placeholder for future RAG/vector memory
  memory: { type: Object, default: {} }, // TODO: Integrate vector memory for RAG (Retrieval-Augmented Generation) to store and retrieve contextual information
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Agent', agentSchema);
