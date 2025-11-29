const mongoose = require('mongoose');
module.exports = mongoose.model('Income', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: String,
  amount: Number,
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}));
