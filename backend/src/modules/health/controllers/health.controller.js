const { 
  getHealthContext, 
  updateHealthContext,
  addWorkout,
  updateMetrics,
  getRecovery
} = require('../services/health.service');

/**
 * Get health context for the authenticated user
 */
exports.getContext = async (req, res) => {
  try {
    const context = await getHealthContext(req.user._id);
    return res.json(context || {});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update health context (metrics, recovery, insights)
 */
exports.updateContext = async (req, res) => {
  try {
    const updated = await updateHealthContext(req.user._id, req.body);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get health metrics
 */
exports.getMetrics = async (req, res) => {
  try {
    const context = await getHealthContext(req.user._id);
    return res.json({ metrics: context?.metrics || {} });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update health metrics (weight, sleep, heartRate, etc.)
 */
exports.updateMetrics = async (req, res) => {
  try {
    const result = await updateMetrics(req.user._id, req.body);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get workout logs
 */
exports.getWorkouts = async (req, res) => {
  try {
    const context = await getHealthContext(req.user._id);
    return res.json({ workouts: context?.workouts || [] });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Add workout log entry
 */
exports.addWorkout = async (req, res) => {
  try {
    const result = await addWorkout(req.user._id, req.body);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get recovery data
 */
exports.getRecovery = async (req, res) => {
  try {
    const recovery = await getRecovery(req.user._id);
    return res.json({ recovery: recovery || {} });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

