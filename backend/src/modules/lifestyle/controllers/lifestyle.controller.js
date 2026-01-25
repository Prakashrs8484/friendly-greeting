const { 
  getLifestyleContext, 
  updateLifestyleContext
} = require('../services/lifestyle.service');

/**
 * Get lifestyle context for the authenticated user
 */
exports.getContext = async (req, res) => {
  try {
    const context = await getLifestyleContext(req.user._id);
    return res.json(context || {});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Update lifestyle context
 */
exports.updateContext = async (req, res) => {
  try {
    const updated = await updateLifestyleContext(req.user._id, req.body);
    return res.json(updated);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
