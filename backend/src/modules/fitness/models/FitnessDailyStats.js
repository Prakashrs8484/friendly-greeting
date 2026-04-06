const mongoose = require('mongoose');

const FitnessDailyStatsSchema = new mongoose.Schema(
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
    intakeCalories: {
      type: Number,
      default: 0,
      min: 0,
    },
    intakeProtein: {
      type: Number,
      default: 0,
      min: 0,
    },
    intakeCarbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    intakeFats: {
      type: Number,
      default: 0,
      min: 0,
    },
    burnedCalories: {
      type: Number,
      default: 0,
      min: 0,
    },
    netCalories: {
      type: Number,
      default: 0,
    },
    deficitCalories: {
      type: Number,
      default: 0,
    },
    calorieTarget: {
      type: Number,
      default: 2000,
      min: 0,
    },
    mealCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    activityCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

FitnessDailyStatsSchema.index({ userId: 1, dateKey: 1 }, { unique: true });

module.exports = mongoose.model('FitnessDailyStats', FitnessDailyStatsSchema);
