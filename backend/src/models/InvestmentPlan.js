const mongoose = require('mongoose');

const InvestmentPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  name: { type: String, default: "Default Plan" },

  allocations: {
    mutualFunds: Number,
    debtFunds: Number,
    stocks: Number,
    fixedDeposits: Number,
    goldFunds: Number
  },

  expectedReturns: {
    mutualFunds: Number,
    debtFunds: Number,
    stocks: Number,
    fixedDeposits: Number,
    goldFunds: Number
  },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("InvestmentPlan", InvestmentPlanSchema);
