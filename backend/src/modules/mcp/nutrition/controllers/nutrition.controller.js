const { analyzeNutritionText } = require('../services/nutritionAnalyzer.service');

async function analyze(req, res) {
  try {
    const { text } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ message: 'text is required and must be a non-empty string' });
    }

    const result = analyzeNutritionText(text);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}

module.exports = {
  analyze
};
