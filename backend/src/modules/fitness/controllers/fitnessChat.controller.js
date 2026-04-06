const fitnessChatService = require('../services/fitnessChat.service');
const healthEngineService = require('../services/healthEngine.service');
const fitnessCoachService = require('../services/fitnessCoach.service');

function mapEventsToParsedActions(events = []) {
  return events
    .map((event) => {
      if (!event || typeof event !== 'object') return null;

      if (event.type === 'meal_log') {
        return {
          actionType: 'meal',
          extractedData: {
            food: event.food,
            calories: event.calories,
            protein: event.protein,
            carbs: event.carbs,
            fat: event.fats,
          },
        };
      }

      if (event.type === 'activity_log') {
        return {
          actionType: 'activity',
          extractedData: {
            activityType: event.activity,
            duration: event.durationMinutes || event.duration,
            caloriesBurned: event.caloriesBurned,
          },
        };
      }

      return null;
    })
    .filter(Boolean);
}

const fitnessChatController = {
  /**
   * POST /api/fitness/chat
   * Single AI call per message:
   * - AI returns chatResponse + events[]
   * - events are processed into structured logs + daily stats
   */
  async handleChat(req, res, next) {
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

      const aiResult = await fitnessChatService.generateChatAndEvents({
        text,
      });

      const engineResult = await healthEngineService.processEvents({
        userId,
        rawText: text,
        events: aiResult.events,
        dateKey,
        timestamp: effectiveTimestamp,
      });

      const parsedActions = mapEventsToParsedActions(engineResult.processedEvents);
      const coachReply = await fitnessCoachService.generateCoachReply(
        parsedActions,
        engineResult.dashboard,
        null
      );

      res.json({
        success: true,
        chatResponse: coachReply || aiResult.chatResponse,
        events: engineResult.processedEvents,
        updatedDailyStats: engineResult.updatedDailyStats,
        dailyMetric: engineResult.dailyMetric,
        dashboard: engineResult.dashboard,
        timeline: engineResult.timeline,
        weeklyAnalytics: engineResult.weeklyAnalytics,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = fitnessChatController;
