const FitnessEntry = require('../models/FitnessEntry');
const FitnessDailyMetric = require('../models/FitnessDailyMetric');
const fitnessDailyMetricService = require('./fitnessDailyMetric.service');

const fitnessResetService = {
  /**
   * Reset all fitness data for a specific date
   * Deletes all FitnessEntry records and corresponding FitnessDailyMetric
   * Preserves goals, profile, and other settings
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {object} Reset confirmation with deleted counts and cleared payload
   */
  async resetDay(userId, dateKey) {
    // Validate dateKey
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      throw new Error('Invalid dateKey format. Use YYYY-MM-DD');
    }

    // Fetch all entries for this date (before deletion)
    const entriesToDelete = await FitnessEntry.find({
      userId,
      dateKey,
    });

    const deletedCount = entriesToDelete.length;
    const deletedByType = {};

    // Count deleted entries by type
    entriesToDelete.forEach((entry) => {
      deletedByType[entry.entryType] = (deletedByType[entry.entryType] || 0) + 1;
    });

    // Hard delete all entries for this date
    await FitnessEntry.deleteMany({
      userId,
      dateKey,
    });

    // Delete the daily metric for this date
    const deletedMetric = await FitnessDailyMetric.findOneAndDelete({
      userId,
      dateKey,
    });

    // Return reset confirmation
    return {
      success: true,
      dateKey,
      deleted: {
        entryCount: deletedCount,
        byType: deletedByType,
        metricRemoved: !!deletedMetric,
      },
      clearedPayload: {
        dateKey,
        date: new Date(dateKey),
        caloriesConsumed: 0,
        caloriesBurned: 0,
        proteinIntake: 0,
        waterIntakeMl: 0,
        workoutMinutes: 0,
        sleepHours: 0,
        recoveryScore: 0,
        fitnessScore: 0,
        streakCount: 0,
        entries: [],
      },
    };
  },

  /**
   * Soft-delete entries (archive instead of permanent delete)
   * Marks entries as deleted but preserves audit trail
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {object} Reset confirmation with soft-delete stats
   */
  async softDeleteDay(userId, dateKey) {
    // Validate dateKey
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      throw new Error('Invalid dateKey format. Use YYYY-MM-DD');
    }

    // Soft delete entries by adding deletedAt timestamp
    const result = await FitnessEntry.updateMany(
      { userId, dateKey },
      { $set: { deletedAt: new Date(), isDeleted: true } }
    );

    const updatedCount = result.modifiedCount;

    // Delete the daily metric
    const deletedMetric = await FitnessDailyMetric.findOneAndDelete({
      userId,
      dateKey,
    });

    return {
      success: true,
      dateKey,
      deleted: {
        entryCount: updatedCount,
        metricRemoved: !!deletedMetric,
        method: 'soft_delete',
      },
      clearedPayload: {
        dateKey,
        date: new Date(dateKey),
        caloriesConsumed: 0,
        caloriesBurned: 0,
        proteinIntake: 0,
        waterIntakeMl: 0,
        workoutMinutes: 0,
        sleepHours: 0,
        recoveryScore: 0,
        fitnessScore: 0,
        streakCount: 0,
        entries: [],
      },
    };
  },

  /**
   * Get entries deleted on a specific date (for audit purposes)
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {array} Array of soft-deleted entries with timestamps
   */
  async getDeletedEntriesForDate(userId, dateKey) {
    return FitnessEntry.find({
      userId,
      dateKey,
      isDeleted: true,
    })
      .sort({ deletedAt: -1 })
      .lean();
  },

  /**
   * Restore soft-deleted entries for a date
   * Reactivates archival entries and recomputes metrics
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {object} Restore confirmation with restored counts
   */
  async restoreDay(userId, dateKey) {
    // Validate dateKey
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
      throw new Error('Invalid dateKey format. Use YYYY-MM-DD');
    }

    // Restore soft-deleted entries
    const result = await FitnessEntry.updateMany(
      { userId, dateKey, isDeleted: true },
      { $unset: { deletedAt: '', isDeleted: '' } }
    );

    const restoredCount = result.modifiedCount;

    // Recompute metrics for restored day
    if (restoredCount > 0) {
      await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);
    }

    // Fetch restored metric
    const restoredMetric = await FitnessDailyMetric.findOne({
      userId,
      dateKey,
    }).lean();

    return {
      success: true,
      dateKey,
      restored: {
        entryCount: restoredCount,
        metricRecomputed: !!restoredMetric,
      },
      restoredPayload: restoredMetric || {
        dateKey,
        caloriesConsumed: 0,
        caloriesBurned: 0,
        proteinIntake: 0,
        workoutMinutes: 0,
        sleepHours: 0,
      },
    };
  },

  /**
   * Get day reset history (audit trail)
   * @param {string} userId - User ID
   * @param {number} days - Number of recent days to check
   * @returns {array} Array of reset events with timestamps
   */
  async getDayResetHistory(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Query soft-deleted entries
    const deletedEntries = await FitnessEntry.find({
      userId,
      isDeleted: true,
      deletedAt: { $gte: startDate },
    })
      .sort({ deletedAt: -1 })
      .select('dateKey deletedAt isDeleted entryType')
      .lean();

    // Group by date and deletion time
    const historyMap = {};
    deletedEntries.forEach((entry) => {
      if (!historyMap[entry.dateKey]) {
        historyMap[entry.dateKey] = {
          dateKey: entry.dateKey,
          deletedAt: entry.deletedAt,
          entryCount: 0,
          entryTypes: {},
        };
      }
      historyMap[entry.dateKey].entryCount++;
      historyMap[entry.dateKey].entryTypes[entry.entryType] =
        (historyMap[entry.dateKey].entryTypes[entry.entryType] || 0) + 1;
    });

    return Object.values(historyMap).sort((a, b) => b.deletedAt - a.deletedAt);
  },

  /**
   * Permanently purge soft-deleted entries older than N days
   * One-way operation, cannot be reversed
   * @param {string} userId - User ID
   * @param {number} daysOld - Delete entries soft-deleted more than N days ago
   * @returns {object} Purge confirmation with count and oldest entry date
   */
  async purgeSoftDeletedEntries(userId, daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Find entries to purge
    const entriesToPurge = await FitnessEntry.find({
      userId,
      isDeleted: true,
      deletedAt: { $lt: cutoffDate },
    });

    const purgeCount = entriesToPurge.length;

    if (purgeCount > 0) {
      // Permanently delete
      await FitnessEntry.deleteMany({
        userId,
        isDeleted: true,
        deletedAt: { $lt: cutoffDate },
      });
    }

    const oldestDeletedEntry = entriesToPurge.length > 0
      ? entriesToPurge.sort((a, b) => a.deletedAt - b.deletedAt)[0]
      : null;

    return {
      success: true,
      purged: {
        entryCount: purgeCount,
        olderThanDays: daysOld,
        oldestEntryDate: oldestDeletedEntry?.dateKey,
      },
    };
  },
};

module.exports = fitnessResetService;
