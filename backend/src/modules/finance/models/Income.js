const mongoose = require('mongoose');

const IncomeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  source: { type: String, required: true },
  amount: { type: Number, required: true },
  frequency: { type: String, enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'], default: 'monthly' },
  category: { type: String },
  date: { type: Date, default: Date.now },
  isRecurring: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Income', IncomeSchema);
