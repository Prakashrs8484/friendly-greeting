const fitnessEntryService = require('../services/fitnessEntry.service');
const fitnessDailyMetricService = require('../services/fitnessDailyMetric.service');

const fitnessEntryController = {
  /**
   * Add a meal entry
   */
  async addMeal(req, res, next) {
    try {
      const userId = req.user._id;
      const { calories, protein, carbs, fat, description, timestamp } = req.body;
      const dateKey = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      const entry = await fitnessEntryService.addEntry(
        userId,
        'meal',
        { calories, protein, carbs, fat, description, timestamp: new Date(timestamp || Date.now()) },
        dateKey
      );

      // Recompute daily metrics for this date
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);

      res.status(201).json({ success: true, entry });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a workout entry
   */
  async addWorkout(req, res, next) {
    try {
      const userId = req.user._id;
      const { duration, workoutType, intensity, caloriesBurned, notes, timestamp } = req.body;
      const dateKey = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      const entry = await fitnessEntryService.addEntry(
        userId,
        'workout',
        { duration, workoutType, intensity, caloriesBurned, notes, timestamp: new Date(timestamp || Date.now()) },
        dateKey
      );

      // Recompute daily metrics for this date
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);

      res.status(201).json({ success: true, entry });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a sleep entry
   */
  async addSleep(req, res, next) {
    try {
      const userId = req.user._id;
      const { startTime, endTime, duration, sleepQuality, timestamp } = req.body;
      const dateKey = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      const entry = await fitnessEntryService.addEntry(
        userId,
        'sleep',
        { startTime, endTime, duration, sleepQuality, timestamp: new Date(timestamp || Date.now()) },
        dateKey
      );

      // Recompute daily metrics for this date
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);

      res.status(201).json({ success: true, entry });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a hydration entry
   */
  async addHydration(req, res, next) {
    try {
      const userId = req.user._id;
      const { volumeMl, timestamp } = req.body;
      const dateKey = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      const entry = await fitnessEntryService.addEntry(
        userId,
        'hydration',
        { volumeMl, timestamp: new Date(timestamp || Date.now()) },
        dateKey
      );

      // Recompute daily metrics for this date
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);

      res.status(201).json({ success: true, entry });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add an activity entry
   */
  async addActivity(req, res, next) {
    try {
      const userId = req.user._id;
      const { duration, activityType, steps, caloriesBurned, timestamp } = req.body;
      const dateKey = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      const entry = await fitnessEntryService.addEntry(
        userId,
        'activity',
        { duration, activityType, steps, caloriesBurned, timestamp: new Date(timestamp || Date.now()) },
        dateKey
      );

      // Recompute daily metrics for this date
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);

      res.status(201).json({ success: true, entry });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Add a recovery entry
   */
  async addRecovery(req, res, next) {
    try {
      const userId = req.user._id;
      const { heartRateVariability, restingHeartRate, recoveryQuality, notes, timestamp } = req.body;
      const dateKey = timestamp ? new Date(timestamp).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      const entry = await fitnessEntryService.addEntry(
        userId,
        'recovery',
        { heartRateVariability, restingHeartRate, recoveryQuality, notes, timestamp: new Date(timestamp || Date.now()) },
        dateKey
      );

      // Recompute daily metrics for this date
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);

      res.status(201).json({ success: true, entry });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get all entries for a specific date
   */
  async getTimelineByDate(req, res, next) {
    try {
      const userId = req.user._id;
      const { dateKey } = req.params;

      const entries = await fitnessEntryService.getEntriesForDay(userId, dateKey);

      res.json({ success: true, entries });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get recent entries
   */
  async getTimeline(req, res, next) {
    try {
      const userId = req.user._id;
      const { days = 7 } = req.query;

      const entries = await fitnessEntryService.getRecentEntries(userId, parseInt(days));

      res.json({ success: true, entries });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessEntryController;
