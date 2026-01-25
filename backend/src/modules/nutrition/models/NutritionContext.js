const mongoose = require('mongoose');
module.exports = mongoose.model('NutritionContext', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  dailyTargets: { type: Object, default: {} }, // calories, protein etc
  logs: { type: Array, default: [] },
  insights: { type: Object, default: {} },
  lastUpdated: { type: Date, default: Date.now }
}));
