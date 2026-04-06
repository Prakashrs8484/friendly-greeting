const mongoose = require('mongoose');

const FitnessActivitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateKey: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    activity: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    unit: {
      type: String,
      default: 'minutes',
      trim: true,
    },
    caloriesBurned: {
      type: Number,
      required: true,
      min: 0,
    },
    sourceCommand: {
      type: String,
      trim: true,
    },
    metadata: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

FitnessActivitySchema.index({ userId: 1, dateKey: 1, timestamp: 1 });

module.exports = mongoose.model('FitnessActivity', FitnessActivitySchema);
