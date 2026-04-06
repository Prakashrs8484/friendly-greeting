const fitnessGoalsService = require('../services/fitnessGoals.service');

const fitnessGoalsController = {
  /**
   * GET /api/fitness/goals
   * Retrieve user's current fitness goals and targets
   */
  async getGoals(req, res, next) {
    try {
      const userId = req.user._id;

      const goals = await fitnessGoalsService.getGoals(userId);

      res.json({
        success: true,
        goals,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/fitness/goals
   * Update user's fitness goals and targets
   * Body: { goalMode?, targets?, description? }
   */
  async updateGoals(req, res, next) {
    try {
      const userId = req.user._id;
      const { goalMode, targets, description } = req.body;

      // Validate goalMode if provided
      if (goalMode) {
        const validModes = ['fat_loss', 'muscle_gain', 'maintenance'];
        if (!validModes.includes(goalMode)) {
          return res.status(400).json({
            success: false,
            message: `Invalid goalMode. Must be one of: ${validModes.join(', ')}`,
          });
        }
      }

      // Prepare updates
      const updates = {};
      if (goalMode) updates.goalMode = goalMode;
      if (targets) updates.targets = targets;
      if (description !== undefined) updates.description = description;

      const updatedGoals = await fitnessGoalsService.updateGoals(userId, updates);

      res.json({
        success: true,
        goals: updatedGoals,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fitness/goals/progress?date=YYYY-MM-DD
   * Get progress toward goals for a specific date
   * Returns dynamic percentage completion and remaining values
   */
  async getGoalsProgress(req, res, next) {
    try {
      const userId = req.user._id;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'date query parameter is required (format: YYYY-MM-DD)',
        });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      const progress = await fitnessGoalsService.getGoalsProgress(userId, date);

      res.json({
        success: true,
        progress,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fitness/goals/defaults?mode=GOAL_MODE
   * Get default targets for a specific goal mode
   */
  async getDefaultTargets(req, res, next) {
    try {
      const { mode } = req.query;

      if (!mode) {
        return res.status(400).json({
          success: false,
          message: 'mode query parameter is required',
        });
      }

      const validModes = ['fat_loss', 'muscle_gain', 'maintenance'];
      if (!validModes.includes(mode)) {
        return res.status(400).json({
          success: false,
          message: `Invalid mode. Must be one of: ${validModes.join(', ')}`,
        });
      }

      const defaults = fitnessGoalsService.getDefaultTargetsForMode(mode);

      res.json({
        success: true,
        mode,
        defaults,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessGoalsController;
