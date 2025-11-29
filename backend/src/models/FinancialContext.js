const mongoose = require('mongoose');
module.exports = mongoose.model('FinancialContext', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  totals: { monthlyIncome: {type:Number,default:0}, totalExpenses:{type:Number,default:0}, netSavings:{type:Number,default:0} },
  categories: { type: Object, default: {} },
  goals: { type: Array, default: [] },
  insights: { type: Object, default: {} },
  lastUpdated: { type: Date, default: Date.now },
  salaryProjection: { type: Object, default: {} },
  activeBudgetPreset: { type: Object, default: {} },
  activeInvestmentPlan: { type: Object, default: {} },
  emergencyPlan: { type: Object, default: {} },
  suggestedBudget: { type: Object, default: {} },
  autoInsights: { type: Array, default: [] },
  pendingActions: { type: Array, default: [] }, // store action objects
autoApply: { type: Boolean, default: false }, // whether to auto apply actions

}));
