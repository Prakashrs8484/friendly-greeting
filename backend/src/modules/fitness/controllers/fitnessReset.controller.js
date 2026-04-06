const fitnessResetService = require('../services/fitnessReset.service');

const fitnessResetController = {
  /**
   * POST /api/fitness/day/reset
   * Hard-delete all fitness entries and daily metric for a specific date
   * Body: { date } in YYYY-MM-DD format
   * Returns: cleared day payload with deletion stats
   */
  async resetDay(req, res, next) {
    try {
      const userId = req.user._id;
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'date is required in body (format: YYYY-MM-DD)',
        });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      const result = await fitnessResetService.resetDay(userId, date);

      res.json({
        success: true,
        message: 'Day reset successfully',
        reset: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/fitness/day/soft-reset
   * Soft-delete (archive) all entries for a date instead of permanent deletion
   * Allows for restoration and audit trail
   * Body: { date } in YYYY-MM-DD format
   */
  async softResetDay(req, res, next) {
    try {
      const userId = req.user._id;
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'date is required in body (format: YYYY-MM-DD)',
        });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      const result = await fitnessResetService.softDeleteDay(userId, date);

      res.json({
        success: true,
        message: 'Day soft-reset successfully (can be restored)',
        reset: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fitness/day/deleted?date=YYYY-MM-DD
   * Get soft-deleted entries for a specific date (audit)
   */
  async getDeletedEntries(req, res, next) {
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

      const deletedEntries = await fitnessResetService.getDeletedEntriesForDate(userId, date);

      res.json({
        success: true,
        date,
        deletedCount: deletedEntries.length,
        deleted: deletedEntries,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/fitness/day/restore
   * Restore soft-deleted entries for a date and recompute metrics
   * Body: { date } in YYYY-MM-DD format
   */
  async restoreDay(req, res, next) {
    try {
      const userId = req.user._id;
      const { date } = req.body;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'date is required in body (format: YYYY-MM-DD)',
        });
      }

      // Validate date format
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format. Use YYYY-MM-DD',
        });
      }

      const result = await fitnessResetService.restoreDay(userId, date);

      res.json({
        success: true,
        message: 'Day restored successfully',
        restored: result,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/fitness/day/reset-history?days=30
   * Get audit trail of deleted/reset days
   */
  async getResetHistory(req, res, next) {
    try {
      const userId = req.user._id;
      const days = parseInt(req.query.days) || 30;

      // Validate days range
      if (days < 1 || days > 365) {
        return res.status(400).json({
          success: false,
          message: 'days parameter must be between 1 and 365',
        });
      }

      const history = await fitnessResetService.getDayResetHistory(userId, days);

      res.json({
        success: true,
        lookbackDays: days,
        totalResetDays: history.length,
        resetHistory: history,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * DELETE /api/fitness/day/purge-deleted
   * Permanently purge soft-deleted entries older than N days
   * One-way operation, cannot be recovered!
   * Query: ?olderThanDays=30
   */
  async purgeSoftDeleted(req, res, next) {
    try {
      const userId = req.user._id;
      const olderThanDays = parseInt(req.query.olderThanDays) || 30;

      // Validate days range
      if (olderThanDays < 1 || olderThanDays > 365) {
        return res.status(400).json({
          success: false,
          message: 'olderThanDays must be between 1 and 365',
        });
      }

      const result = await fitnessResetService.purgeSoftDeletedEntries(userId, olderThanDays);

      res.json({
        success: true,
        message: `Permanently purged ${result.purged.entryCount} soft-deleted entries`,
        purge: result,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessResetController;
