const fitnessDailyMetricService = require('../services/fitnessDailyMetric.service');

const fitnessDailyMetricController = {
  /**
   * Trigger recomputation of daily metrics and return the result
   */
  async recomputeAndReturn(req, res, next) {
    try {
      const userId = req.user._id;
      const { dateKey } = req.params;

      const metric = await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);

      res.json({ success: true, metric });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get a precomputed daily metric
   */
  async getDailyMetric(req, res, next) {
    try {
      const userId = req.user._id;
      const { dateKey } = req.params;

      const metric = await fitnessDailyMetricService.getDailyMetric(userId, dateKey);

      res.json({ success: true, metric: metric || null });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get dashboard payload with aggregated metrics and progress
   */
  async getDashboard(req, res, next) {
    try {
      const userId = req.user._id;

      const dashboardData = await fitnessDailyMetricService.getDashboardPayload(userId);

      // Return dashboard in expected format: { success, dashboard: {...}, lastUpdated }
      res.json({
        success: true,
        dashboard: dashboardData.today || {
          dateKey: new Date().toISOString().split('T')[0],
          caloriesConsumed: 0,
          caloriesBurned: 0,
          netCalories: 0,
          proteinIntake: 0,
          carbsIntake: 0,
          fatIntake: 0,
          waterIntakeMl: 0,
          workoutMinutes: 0,
          sleepHours: 0,
          recoveryScore: 0,
          fitnessScore: 0,
          streakCount: 0,
          weeklyStats: dashboardData.weeklyStats,
        },
        weeklyStats: dashboardData.weeklyStats,
        lastSevenDays: dashboardData.lastSevenDays,
        currentStreak: dashboardData.currentStreak,
        progressTowardGoals: dashboardData.progressTowardGoals,
        profile: dashboardData.profile,
        lastUpdated: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessDailyMetricController;
