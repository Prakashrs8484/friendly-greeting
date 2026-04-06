const FitnessEntry = require('../models/FitnessEntry');
const fitnessDailyMetricService = require('../services/fitnessDailyMetric.service');

const fitnessTimelineController = {
  /**
   * GET /api/fitness/timeline?date=YYYY-MM-DD
   * Retrieve all entries for a specific date, sorted chronologically
   */
  async getTimelineByDate(req, res, next) {
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

      const entries = await FitnessEntry.find({
        userId,
        dateKey: date,
      })
        .sort({ timestamp: 1 })
        .lean();

      res.json({
        success: true,
        date,
        entries,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/fitness/timeline
   * Create a new fitness entry
   * Body: { entryType, subtype?, timestamp?, description?, source?, aiEstimated?, ...fieldsBasedOnType }
   */
  async createEntry(req, res, next) {
    try {
      const userId = req.user._id;
      const {
        entryType,
        subtype,
        timestamp,
        description,
        source = 'manual',
        aiEstimated = false,
        ...otherFields
      } = req.body;

      // Validate entryType
      const validTypes = ['meal', 'workout', 'sleep', 'hydration', 'activity', 'recovery'];
      if (!entryType || !validTypes.includes(entryType)) {
        return res.status(400).json({
          success: false,
          message: `Invalid entryType. Must be one of: ${validTypes.join(', ')}`,
        });
      }

      // Determine dateKey
      const entryDate = timestamp ? new Date(timestamp) : new Date();
      const dateKey = entryDate.toISOString().split('T')[0];

      // Create entry
      const entry = new FitnessEntry({
        userId,
        entryType,
        subtype,
        dateKey,
        timestamp: entryDate,
        description,
        source,
        aiEstimated,
        ...otherFields,
      });

      await entry.save();

      // Trigger metric recomputation for affected day
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);

      res.status(201).json({
        success: true,
        entry: entry.toObject(),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/fitness/timeline/:entryId
   * Update an existing entry
   */
  async updateEntry(req, res, next) {
    try {
      const userId = req.user._id;
      const { entryId } = req.params;
      const updates = req.body;

      // Validate entryId format
      if (!entryId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid entry ID format',
        });
      }

      // Find entry
      const entry = await FitnessEntry.findOne({
        _id: entryId,
        userId,
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Entry not found',
        });
      }

      // Store original dateKey for metric update
      const originalDateKey = entry.dateKey;

      // Fields that should not be updated
      const restrictedFields = ['_id', 'userId', 'createdAt'];

      // Update allowed fields
      const allowedFields = [
        'entryType',
        'subtype',
        'timestamp',
        'description',
        'source',
        'aiEstimated',
        // Meal fields
        'calories',
        'protein',
        'carbs',
        'fat',
        // Workout fields
        'workoutType',
        'intensity',
        'caloriesBurned',
        'notes',
        // Sleep fields
        'startTime',
        'endTime',
        'duration',
        'sleepQuality',
        // Hydration fields
        'volumeMl',
        // Activity fields
        'activityType',
        'steps',
        // Recovery fields
        'heartRateVariability',
        'restingHeartRate',
        'recoveryQuality',
        // Metadata
        'metadata',
      ];

      for (const field of allowedFields) {
        if (field in updates) {
          entry[field] = updates[field];
        }
      }

      // Update dateKey if timestamp changed
      if (updates.timestamp) {
        const newDate = new Date(updates.timestamp);
        entry.dateKey = newDate.toISOString().split('T')[0];
      }

      await entry.save();

      // Recompute metrics for both original and new dates (if dateKey changed)
      const newDateKey = entry.dateKey;
      if (originalDateKey !== newDateKey) {
        await fitnessDailyMetricService.recomputeDailyMetrics(userId, originalDateKey);
      }
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, newDateKey);

      res.json({
        success: true,
        entry: entry.toObject(),
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/fitness/timeline/:entryId
   * Delete an entry
   */
  async deleteEntry(req, res, next) {
    try {
      const userId = req.user._id;
      const { entryId } = req.params;

      // Validate entryId format
      if (!entryId.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid entry ID format',
        });
      }

      // Find and delete entry
      const entry = await FitnessEntry.findOneAndDelete({
        _id: entryId,
        userId,
      });

      if (!entry) {
        return res.status(404).json({
          success: false,
          message: 'Entry not found',
        });
      }

      // Recompute metrics for affected day
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, entry.dateKey);

      res.json({
        success: true,
        message: 'Entry deleted successfully',
        deletedEntry: entry.toObject(),
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessTimelineController;
