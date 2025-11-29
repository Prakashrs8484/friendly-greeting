const mongoose = require('mongoose');
module.exports = mongoose.model('Goal', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  category: String,
  targetAmount: Number,
  savedAmount: { type: Number, default: 0 },
  dueDate: Date,
  createdAt: { type: Date, default: Date.now }
}));
