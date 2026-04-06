const fitnessProfileService = require('../services/fitnessProfile.service');

const fitnessProfileController = {
  /**
   * Get user's fitness profile
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user._id;

      const profile = await fitnessProfileService.getProfile(userId);

      res.json({ success: true, profile });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user's fitness profile
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const updates = req.body;

      const profile = await fitnessProfileService.updateProfile(userId, updates);

      res.json({ success: true, profile });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessProfileController;
