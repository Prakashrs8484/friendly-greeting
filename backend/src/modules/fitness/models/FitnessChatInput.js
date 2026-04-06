const mongoose = require('mongoose');

const FitnessChatInputSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rawText: {
      type: String,
      required: true,
    },
    dateKey: {
      type: String, // Format: 'YYYY-MM-DD'
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    parsedActions: [
      {
        actionType: {
          type: String,
          enum: ['meal', 'workout', 'sleep', 'hydration', 'activity', 'recovery'],
        },
        extractedData: mongoose.Schema.Types.Mixed,
        confidence: Number,
        source: {
          type: String,
          enum: ['rule', 'llm'],
        },
      },
    ],
    parsingFlags: {
      requiresManualReview: Boolean,
      ambiguities: [String],
      fallbackUsed: Boolean,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
FitnessChatInputSchema.index({ userId: 1, dateKey: 1 });
FitnessChatInputSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('FitnessChatInput', FitnessChatInputSchema);
