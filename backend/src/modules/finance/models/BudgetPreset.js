const mongoose = require('mongoose');

const BudgetPresetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  bracket: { type: String }, // bracket1, bracket2, bracket3
  splits: {
    needs: Number,
    wants: Number,
    investments: Number,
    emergency: Number
  },
  categories: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BudgetPreset', BudgetPresetSchema);
