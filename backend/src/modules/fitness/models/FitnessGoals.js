const mongoose = require('mongoose');

const FitnessGoalsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    goalMode: {
      type: String,
      enum: ['fat_loss', 'muscle_gain', 'maintenance'],
      default: 'maintenance',
    },
    targets: {
      calories: {
        type: Number,
        default: 2000, // daily calories
      },
      protein: {
        type: Number,
        default: 150, // grams per day
      },
      water: {
        type: Number,
        default: 2000, // ml per day
      },
      workoutMinutes: {
        type: Number,
        default: 30, // minutes per day (50 per week / 7)
      },
      sleepHours: {
        type: Number,
        default: 8, // hours per day
      },
    },
    description: {
      type: String, // Optional note about goals, e.g., "Cutting phase - 20% deficit"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FitnessGoals', FitnessGoalsSchema);
