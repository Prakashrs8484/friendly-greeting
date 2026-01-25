const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isRecurring: { type: Boolean, default: false },
  frequency: { type: String, enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'], default: 'monthly' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
