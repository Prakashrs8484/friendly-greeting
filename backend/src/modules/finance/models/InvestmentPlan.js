const mongoose = require('mongoose');

const InvestmentPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['stocks', 'bonds', 'mutual_funds', 'real_estate', 'crypto', 'mixed'], default: 'mixed' },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  targetAllocation: { type: Object, default: {} }, // e.g., { stocks: 60, bonds: 40 }
  currentValue: { type: Number, default: 0 },
  monthlyContribution: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('InvestmentPlan', InvestmentPlanSchema);
