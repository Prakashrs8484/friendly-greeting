const fitnessRecoveryService = require('../services/fitnessRecovery.service');

const fitnessRecoveryController = {
  /**
   * GET /api/fitness/recovery?date=YYYY-MM-DD
   * Get comprehensive recovery data including signals, scores, and recommendations
   */
  async getRecoveryData(req, res, next) {
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

      const recoveryData = await fitnessRecoveryService.getRecoveryData(userId, date);

      res.json({
        success: true,
        recovery: recoveryData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/fitness/recovery/signals
   * Record recovery signals for a user
   * Body: { muscleSoreness, stressLevel, restingHeartRate, injuryNotes?, energyLevel?, moodScore?, date?, timestamp? }
   */
  async addRecoverySignals(req, res, next) {
    try {
      const userId = req.user._id;
      const {
        muscleSoreness,
        stressLevel,
        restingHeartRate,
        injuryNotes,
        energyLevel,
        moodScore,
        date,
        timestamp,
      } = req.body;

      // Validate required fields
      if (
        muscleSoreness === undefined ||
        stressLevel === undefined ||
        restingHeartRate === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            'Required fields: muscleSoreness, stressLevel, restingHeartRate. All must be provided as numbers.',
        });
      }

      // Validate ranges
      if (muscleSoreness < 1 || muscleSoreness > 10) {
        return res.status(400).json({
          success: false,
          message: 'muscleSoreness must be between 1-10',
        });
      }

      if (stressLevel < 1 || stressLevel > 10) {
        return res.status(400).json({
          success: false,
          message: 'stressLevel must be between 1-10',
        });
      }

      if (restingHeartRate < 30 || restingHeartRate > 150) {
        return res.status(400).json({
          success: false,
          message: 'restingHeartRate must be between 30-150 bpm',
        });
      }

      // Validate optional numeric fields
      if (energyLevel !== undefined && (energyLevel < 1 || energyLevel > 10)) {
        return res.status(400).json({
          success: false,
          message: 'energyLevel must be between 1-10',
        });
      }

      if (moodScore !== undefined && (moodScore < 1 || moodScore > 10)) {
        return res.status(400).json({
          success: false,
          message: 'moodScore must be between 1-10',
        });
      }

      // Determine dateKey
      const signalDate = timestamp ? new Date(timestamp) : new Date();
      const dateKey = date || signalDate.toISOString().split('T')[0];

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      // Prepare signals object
      const signals = {
        muscleSoreness,
        stressLevel,
        restingHeartRate,
      };

      if (injuryNotes) signals.injuryNotes = injuryNotes;
      if (energyLevel !== undefined) signals.energyLevel = energyLevel;
      if (moodScore !== undefined) signals.moodScore = moodScore;

      // Save recovery signals
      const savedSignals = await fitnessRecoveryService.addRecoverySignals(
        userId,
        dateKey,
        signals
      );

      // Get full recovery data with recommendations
      const recoveryData = await fitnessRecoveryService.getRecoveryData(userId, dateKey);

      res.status(201).json({
        success: true,
        signals: savedSignals,
        recovery: recoveryData,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fitness/recovery/trend?start=YYYY-MM-DD&end=YYYY-MM-DD
   * Get recovery trend over a date range
   */
  async getRecoveryTrend(req, res, next) {
    try {
      const userId = req.user._id;
      const { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).json({
          success: false,
          message: 'Required query parameters: start, end (format: YYYY-MM-DD)',
        });
      }

      // Validate date formats
      if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      // Validate date range
      if (new Date(start) > new Date(end)) {
        return res.status(400).json({
          success: false,
          message: 'Start date cannot be after end date',
        });
      }

      const trend = await fitnessRecoveryService.getRecoveryTrend(userId, start, end);

      res.json({
        success: true,
        dateRange: { start, end },
        daysCount: trend.length,
        trend,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessRecoveryController;
