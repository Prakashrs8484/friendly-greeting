const mongoose = require('mongoose');

module.exports = mongoose.model('FinancialContext', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  budget: { type: Object, default: {} },
  goals: { type: Array, default: [] },
  investments: { type: Object, default: {} },
  insights: { type: Object, default: {} },
  pendingActions: { type: Array, default: [] },
  activeBudgetPreset: { type: mongoose.Schema.Types.ObjectId, ref: 'BudgetPreset' },
  activeInvestmentPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'InvestmentPlan' },
  autoInsights: { type: Array, default: [] },
  lastUpdated: { type: Date, default: Date.now }
}));
