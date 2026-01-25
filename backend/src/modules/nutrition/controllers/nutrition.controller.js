const { 
  getNutritionContext, 
  updateNutritionContext,
  addNutritionLog,
  updateDailyTargets
} = require('../services/nutrition.service');

/**
 * Get nutrition context for the authenticated user
 */
exports.getContext = async (req, res) => {
  try {
    const context = await getNutritionContext(req.user._id);
    return res.json(context || {});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update nutrition context (daily targets, logs, insights)
 */
exports.updateContext = async (req, res) => {
  try {
    const updated = await updateNutritionContext(req.user._id, req.body);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get nutrition logs
 */
exports.getLogs = async (req, res) => {
  try {
    const context = await getNutritionContext(req.user._id);
    return res.json({ logs: context?.logs || [] });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Add nutrition log entry
 */
exports.addLog = async (req, res) => {
  try {
    const result = await addNutritionLog(req.user._id, req.body);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update daily targets
 */
exports.updateTargets = async (req, res) => {
  try {
    const result = await updateDailyTargets(req.user._id, req.body);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

