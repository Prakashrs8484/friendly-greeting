const mongoose = require('mongoose');

/**
 * Feature model for auto-generated features within Agent Pages
 * Features are created from natural language descriptions and include:
 * - UI configuration (layout, components, actions)
 * - Associated agents
 * - Feature-specific data models
 * 
 * TODO: Future enhancements:
 * - Advanced intent understanding: Use LLM for complex feature parsing
 * - Dynamic UI generation: Generate UI components programmatically
 * - Agent collaboration: Enable features to use multiple agents together
 * - Long-term memory: RAG integration for feature-specific context
 */
const featureSchema = new mongoose.Schema({
  pageId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'AgentPage', 
    required: true,
    index: true
  },
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  type: { 
    type: String, 
    enum: ['todo', 'notes', 'advice', 'tracker', 'insights', 'ideas', 'research-tracker', 'custom'],
    required: true 
  },
  // Feature category: 'functional' or 'chat'
  category: {
    type: String,
    enum: ['functional', 'chat'],
    default: 'functional'
  },
  // UI configuration - defines how the feature renders
  uiConfig: {
    layout: { 
      type: String, 
      enum: ['crud', 'input-output', 'list', 'dashboard', 'custom'],
      default: 'custom'
    },
    components: { 
      type: [String], 
      default: [] // e.g., ['list', 'form', 'insights']
    },
    actions: { 
      type: [String], 
      default: [] // e.g., ['add', 'edit', 'delete', 'insights']
    }
  },
  // Feature-specific configuration
  config: { 
    type: Object, 
    default: {} 
  },
  // Associated agents for this feature
  agentIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Agent' 
  }],
  // Original user input that created this feature
  originalInput: { 
    type: String, 
    required: true 
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

// Index for efficient queries
featureSchema.index({ pageId: 1, createdAt: -1 });

module.exports = mongoose.model('Feature', featureSchema);
