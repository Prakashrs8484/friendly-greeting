const mongoose = require('mongoose');

/**
 * Message model for page-level and agent-level conversation memory
 * - pageId + agentId: chat thread for that agent (user and agent messages both have agentId)
 * - pageId + agentId=null: page-level entries (e.g. feature summaries)
 *
 * TODO: Future enhancements:
 * - Vector memory: Store embeddings for semantic search
 * - RAG integration: Retrieval-Augmented Generation for context-aware responses
 */
const messageSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgentPage',
    required: true,
    index: true
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    default: null // null = page-level (summaries, etc.); set = thread for that agent
  },
  // Optional linkage for feature-related page memory (summaries/events/insights)
  // Used for clean cascade deletes when a feature is removed.
  featureId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Feature',
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'agent'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  source: {
    type: String,
    enum: ['chat', 'feature'],
    default: 'chat'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Compound indexes for efficient queries
messageSchema.index({ pageId: 1, agentId: 1, createdAt: 1 });
messageSchema.index({ pageId: 1, featureId: 1, createdAt: 1 });
messageSchema.index({ pageId: 1, createdAt: 1 });

module.exports = mongoose.model('Message', messageSchema);
