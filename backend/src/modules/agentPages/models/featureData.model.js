const mongoose = require('mongoose');

/**
 * Feature Data Model
 * Stores actual data for each feature (ideas, research topics, todos, etc.)
 * This is the single source of truth for feature data
 * 
 * TODO: Future enhancements:
 * - Vector embeddings for semantic search
 * - Feature-specific indexing
 * - Data versioning for undo/redo
 */
const featureDataSchema = new mongoose.Schema({
  pageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AgentPage', 
    required: true,
    index: true
  },
  featureId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Feature', 
    required: true,
    index: true
  },
  featureType: {
    type: String,
    enum: ['todo', 'notes', 'advice', 'tracker', 'insights', 'ideas', 'research-tracker', 'custom'],
    required: true,
    index: true
  },
  // Feature-specific data (flexible structure)
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  // AI-generated summary (updated when data changes)
  aiSummary: {
    type: String,
    default: ''
  },
  // Last time AI summary was generated
  aiSummaryUpdatedAt: {
    type: Date,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Compound index for efficient queries
featureDataSchema.index({ pageId: 1, featureId: 1 });
featureDataSchema.index({ pageId: 1, featureType: 1 });

module.exports = mongoose.model('FeatureData', featureDataSchema);
