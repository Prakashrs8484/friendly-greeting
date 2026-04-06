const mongoose = require('mongoose');

const FitnessMealSchema = new mongoose.Schema(
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
    food: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.1,
    },
    unit: {
      type: String,
      required: true,
      trim: true,
    },
    calories: {
      type: Number,
      required: true,
      min: 0,
    },
    protein: {
      type: Number,
      default: 0,
      min: 0,
    },
    carbs: {
      type: Number,
      default: 0,
      min: 0,
    },
    fats: {
      type: Number,
      default: 0,
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

FitnessMealSchema.index({ userId: 1, dateKey: 1, timestamp: 1 });

module.exports = mongoose.model('FitnessMeal', FitnessMealSchema);
