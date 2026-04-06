const fitnessAnalyticsService = require('../services/fitnessAnalytics.service');

const fitnessAnalyticsController = {
  /**
   * GET /api/fitness/analytics/weekly?endDate=YYYY-MM-DD
   * Get 7-day weekly analytics ending on endDate
   * Returns: daily breakdown, weekly summary, deficit/surplus trend
   */
  async getWeeklyAnalytics(req, res, next) {
    try {
      const userId = req.user._id;
      const { endDate } = req.query;

      if (!endDate) {
        return res.status(400).json({
          success: false,
          message: 'endDate query parameter is required (format: YYYY-MM-DD)',
        });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      const result = await fitnessAnalyticsService.getWeeklyAnalytics(userId, endDate);

      res.json({
        success: true,
        analytics: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fitness/analytics/trends?from=YYYY-MM-DD&to=YYYY-MM-DD
   * Get trend analytics across custom date range
   * Returns: trend data, summary statistics, goal achievement rates
   */
  async getTrendAnalytics(req, res, next) {
    try {
      const userId = req.user._id;
      const { from, to } = req.query;

      if (!from || !to) {
        return res.status(400).json({
          success: false,
          message: 'from and to query parameters are required (format: YYYY-MM-DD)',
        });
      }

      // Validate date formats
      if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      const result = await fitnessAnalyticsService.getTrendAnalytics(userId, from, to);

      res.json({
        success: true,
        analytics: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessAnalyticsController;
