const mongoose = require('mongoose');

const FitnessDailyMetricSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    dateKey: {
      type: String, // Format: 'YYYY-MM-DD'
      required: true,
    },
    caloriesConsumed: {
      type: Number,
      default: 0,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    netCalories: {
      type: Number,
      default: 0,
    },
    proteinIntake: {
      type: Number,
      default: 0,
    },
    carbsIntake: {
      type: Number,
      default: 0,
    },
    fatIntake: {
      type: Number,
      default: 0,
    },
    waterIntakeMl: {
      type: Number,
      default: 0,
    },
    workoutMinutes: {
      type: Number,
      default: 0,
    },
    sleepHours: {
      type: Number,
      default: 0,
    },
    recoveryScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    fitnessScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    streakCount: {
      type: Number,
      default: 0,
    },
    metadata: mongoose.Schema.Types.Mixed,
    lastComputedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Unique index to prevent duplicate documents per user per day
FitnessDailyMetricSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('FitnessDailyMetric', FitnessDailyMetricSchema);
