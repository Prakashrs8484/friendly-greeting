const healthCommandParserService = require('../services/healthCommandParser.service');
const healthEngineService = require('../services/healthEngine.service');

const fitnessCommandController = {
  /**
   * POST /api/fitness/command
   * Accepts natural language command, parses it to strict JSON, logs structured entries,
   * and returns updated fitness stats for UI refresh.
   */
  async handleCommand(req, res, next) {
    try {
      const userId = req.user._id;
      const { text, date, timestamp } = req.body;

      if (!text || !text.trim()) {
        return res.status(400).json({
          success: false,
          message: 'text is required',
        });
      }

      const effectiveTimestamp = timestamp ? new Date(timestamp) : new Date();
      const dateKey = date || effectiveTimestamp.toISOString().split('T')[0];

      const parsedCommand = await healthCommandParserService.parseCommand(text);
      const engineResult = await healthEngineService.processCommand({
        userId,
        rawText: text,
        parsedCommand,
        dateKey,
        timestamp: effectiveTimestamp,
      });

      res.json({
        success: true,
        parsedCommand: engineResult.parsedCommand,
        event: engineResult.event,
        dailyStats: engineResult.dailyStats,
        dailyMetric: engineResult.dailyMetric,
        dashboard: engineResult.dashboard,
        timeline: engineResult.timeline,
        weeklyAnalytics: engineResult.weeklyAnalytics,
        collectionsUpdated: engineResult.collections,
      });
    } catch (error) {
      if (error.message && error.message.toLowerCase().includes('unable to parse')) {
        return res.status(422).json({
          success: false,
          message: error.message,
        });
      }

      return next(error);
    }
  },
};

module.exports = fitnessCommandController;
