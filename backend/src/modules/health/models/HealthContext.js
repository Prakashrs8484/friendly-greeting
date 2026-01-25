const mongoose = require('mongoose');
module.exports = mongoose.model('HealthContext', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  metrics: { type: Object, default: {} }, // weight, sleep, heartRate etc
  workouts: { type: Array, default: [] },
  recovery: { type: Object, default: {} },
  insights: { type: Object, default: {} },
  lastUpdated: { type: Date, default: Date.now }
}));
