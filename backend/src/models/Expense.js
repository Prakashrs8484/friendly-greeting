const mongoose = require('mongoose');
module.exports = mongoose.model('Expense', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  category: String,
  amount: Number,
  paymentMethod: String,
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
}));
