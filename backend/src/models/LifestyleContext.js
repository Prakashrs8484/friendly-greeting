const mongoose = require('mongoose');
module.exports = mongoose.model('LifestyleContext', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  habits: { type: Array, default: [] },
  moodLogs: { type: Array, default: [] },
  routine: { type: Object, default: {} },
  insights: { type: Object, default: {} },
  lastUpdated: { type: Date, default: Date.now }
}));
