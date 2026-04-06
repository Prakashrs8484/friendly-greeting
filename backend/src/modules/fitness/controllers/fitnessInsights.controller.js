const fitnessInsightsService = require('../services/fitnessInsights.service');

const fitnessInsightsController = {
  /**
   * GET /api/fitness/insights?date=YYYY-MM-DD
   * Get AI-powered insights for a specific date with coach advice, meal suggestions, workout recommendations, and budget food swaps
   */
  async getInsights(req, res, next) {
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

      const result = await fitnessInsightsService.getInsights(userId, date);

      res.json({
        success: true,
        date,
        insights: result.insights,
        cached: result.cached,
        aiUsed: result.aiUsed,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessInsightsController;
