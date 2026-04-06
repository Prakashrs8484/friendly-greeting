const mongoose = require('mongoose');

const FitnessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    dailyCalorieGoal: {
      type: Number,
      default: 2000,
    },
    dailyProteinGoal: {
      type: Number,
      default: 150, // grams
    },
    dailyWaterGoal: {
      type: Number,
      default: 2000, // ml
    },
    weeklyWorkoutMinutesGoal: {
      type: Number,
      default: 300, // minutes per week
    },
    dailySleepGoal: {
      type: Number,
      default: 8, // hours
    },
    recoveryTargetScore: {
      type: Number,
      default: 80,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FitnessProfile', FitnessProfileSchema);
