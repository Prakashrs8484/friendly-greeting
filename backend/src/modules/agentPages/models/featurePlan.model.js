const mongoose = require('mongoose');

/**
 * Feature Plan Model
 * Stores structured AI-generated feature plans for Agent Pages.
 */
const featurePlanSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgentPage',
    required: true,
    index: true
  },
  featureName: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  ui: {
    type: [Object],
    default: []
  },
  dataModel: {
    type: [String],
    default: []
  },
  aiCapabilities: {
    type: [String],
    default: []
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

featurePlanSchema.index({ pageId: 1, createdAt: -1 });

module.exports = mongoose.model('FeaturePlan', featurePlanSchema);
