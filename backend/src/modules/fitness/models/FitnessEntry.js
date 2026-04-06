const mongoose = require('mongoose');

const FitnessEntrySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    entryType: {
      type: String,
      enum: ['meal', 'workout', 'sleep', 'hydration', 'activity', 'recovery'],
      required: true,
    },
    subtype: {
      type: String, // e.g., 'breakfast', 'lunch', 'dinner' for meals
    },
    dateKey: {
      type: String, // Format: 'YYYY-MM-DD'
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    description: String,
    source: {
      type: String,
      enum: ['manual', 'chat'],
      default: 'manual',
    },
    aiEstimated: {
      type: Boolean,
      default: false, // true if values were estimated by parser/LLM
    },

    // Meal fields
    calories: Number,
    protein: Number, // grams
    carbs: Number,
    fat: Number,

    // Workout fields
    workoutType: String,
    intensity: String, // 'low', 'medium', 'high'
    caloriesBurned: Number,
    notes: String,

    // Sleep fields
    startTime: Date,
    endTime: Date,
    duration: Number, // hours
    sleepQuality: Number, // 1-10 rating

    // Hydration fields
    volumeMl: Number,

    // Activity fields
    activityType: String,
    steps: Number,

    // Recovery fields
    heartRateVariability: Number,
    restingHeartRate: Number,
    recoveryQuality: Number, // 1-10 rating

    // Flexible metadata
    metadata: mongoose.Schema.Types.Mixed,

    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  { timestamps: true }
);

// Indexes for efficient querying
FitnessEntrySchema.index({ userId: 1, dateKey: 1 });
FitnessEntrySchema.index({ userId: 1, dateKey: 1, timestamp: 1 });
FitnessEntrySchema.index({ userId: 1, createdAt: -1 });
FitnessEntrySchema.index({ userId: 1, timestamp: -1 });
FitnessEntrySchema.index({ userId: 1, isDeleted: 1, deletedAt: -1 }); // For soft-delete queries

// Middleware: auto-exclude soft-deleted entries from queries
// This ensures deleted entries don't show up in normal find/findOne/countDocuments operations
FitnessEntrySchema.pre(/^find/, function (next) {
  // Only filter if not explicitly querying for deleted entries
  if (this.getOptions()._recursed) {
    return next();
  }
  this.where({ isDeleted: { $ne: true } });
  next();
});

module.exports = mongoose.model('FitnessEntry', FitnessEntrySchema);
