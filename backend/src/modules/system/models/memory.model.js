const mongoose = require("mongoose");

const MemorySchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
    // examples: "note", "summary", "scene", "character",
    // "rewrite", "idea", "dialogue", "action_item", "outline", "agent_reply"
  },

  title: {
    type: String,
    default: ""
  },

  content: {
    type: String,
    required: true
  },

  excerpt: {
    type: String,
    default: ""
  },

  metadata: {
    type: Object,
    default: {}
    // examples:
    // { noteId, feature: "sceneBuilder", mood, location, tags: [], userId }
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

// Text index to enable relevance-based search
MemorySchema.index(
  { title: "text", content: "text", excerpt: "text" },
  { weights: { title: 5, excerpt: 3, content: 2 } }
);

module.exports = mongoose.model("Memory", MemorySchema);
