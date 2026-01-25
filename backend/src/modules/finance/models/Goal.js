const mongoose = require('mongoose');

const GoalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, required: true },
  currentAmount: { type: Number, default: 0 },
  deadline: { type: Date },
  category: { type: String, enum: ['emergency_fund', 'vacation', 'car', 'house', 'education', 'retirement', 'other'], default: 'other' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Goal', GoalSchema);
