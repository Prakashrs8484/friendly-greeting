const mongoose = require('mongoose');

const FitnessRecoverySignalsSchema = new mongoose.Schema(
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
    timestamp: {
      type: Date,
      default: Date.now,
    },
    muscleSoreness: {
      type: Number, // 1-10 scale (1 = no soreness, 10 = severe)
      min: 1,
      max: 10,
    },
    stressLevel: {
      type: Number, // 1-10 scale (1 = very relaxed, 10 = very stressed)
      min: 1,
      max: 10,
    },
    restingHeartRate: {
      type: Number, // bpm
      min: 30,
      max: 150,
    },
    injuryNotes: {
      type: String, // Optional notes about any injuries or discomfort
    },
    energyLevel: {
      type: Number, // 1-10 scale (optional, 1 = very tired, 10 = full energy)
      min: 1,
      max: 10,
    },
    moodScore: {
      type: Number, // 1-10 scale (optional, for mental state)
      min: 1,
      max: 10,
    },
  },
  { timestamps: true }
);

// Indexes for efficient querying
FitnessRecoverySignalsSchema.index({ userId: 1, dateKey: 1 }, { unique: true });
FitnessRecoverySignalsSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('FitnessRecoverySignals', FitnessRecoverySignalsSchema);
