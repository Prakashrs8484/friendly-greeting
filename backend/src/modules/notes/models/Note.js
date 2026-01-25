const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, required: true },
    content: { type: String, required: true },

    category: { type: String, default: "General" },  
    tags: { type: [String], default: [] },

    summary: { type: String, default: "" },  // AI-generated
    emotion: {
      label: { type: String, default: "" },
      score: { type: Number, default: 0 }
    },

    embeddings: { type: Array, default: [] }, // vector embeddings for RAG

    isLocked: { type: Boolean, default: false }, // For diary/privacy mode

  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", NoteSchema);
