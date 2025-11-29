const mongoose = require('mongoose');
module.exports = mongoose.model('CareerContext', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  currentRole: String,
  skills: { type: Array, default: [] },
  learningProgress: { type: Array, default: [] },
  goals: { type: Array, default: [] },
  insights: { type: Object, default: {} },
  lastUpdated: { type: Date, default: Date.now }
}));
