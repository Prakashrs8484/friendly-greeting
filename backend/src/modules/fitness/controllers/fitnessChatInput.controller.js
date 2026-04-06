const FitnessChatInput = require('../models/FitnessChatInput');
const fitnessParserService = require('../services/fitnessParser.service');
const fitnessCoachService = require('../services/fitnessCoach.service');
const fitnessEntryService = require('../services/fitnessEntry.service');
const fitnessDailyMetricService = require('../services/fitnessDailyMetric.service');
const fitnessProfileService = require('../services/fitnessProfile.service');

const fitnessChatInputController = {
  /**
   * Handle POST /api/fitness/chat/input
   * Flow: Parse → Store → Create Entries → Recompute Metrics → Generate Coach Reply
   */
  async handleChatInput(req, res, next) {
    try {
      const userId = req.user._id;
      const { text, date, timestamp } = req.body;

      // Validate input
      if (!text || text.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Text input is required',
        });
      }

      // Determine date and timestamp
      const inputDate = timestamp ? new Date(timestamp) : new Date();
      const dateKey = date || inputDate.toISOString().split('T')[0];

      // Get user profile
      const userProfile = await fitnessProfileService.getProfile(userId);

      // Step 1: Parse text into actions
      const parseResult = await fitnessParserService.parseTextInput(text, userProfile, dateKey);
      const parsedActions = parseResult.actions || [];
      const parsingFlags = parseResult.flags || {};

      // Step 2: Store raw input with parsed actions
      const chatInput = new FitnessChatInput({
        userId,
        rawText: text,
        dateKey,
        timestamp: inputDate,
        parsedActions,
        parsingFlags,
      });
      await chatInput.save();

      // Step 3: Create FitnessEntry for each parsed action
      const createdEntries = [];
      for (const action of parsedActions) {
        try {
          const entryData = this.convertActionToEntryData(action);
          const entry = await fitnessEntryService.addEntry(
            userId,
            action.actionType,
            entryData,
            dateKey
          );
          createdEntries.push({
            _id: entry._id,
            entryType: entry.entryType,
            ...entryData,
          });
        } catch (error) {
          console.error(`Error creating entry for action ${action.actionType}:`, error.message);
        }
      }

      // Step 4: Recompute daily metrics
      const updatedMetric = await fitnessDailyMetricService.recomputeDailyMetrics(userId, dateKey);

      // Step 5: Get updated dashboard
      const updatedDashboard = await fitnessDailyMetricService.getDashboardPayload(userId);

      // Step 6: Generate coach reply
      const coachReply = await fitnessCoachService.generateCoachReply(
        parsedActions,
        updatedDashboard,
        userProfile
      );

      // Return comprehensive response
      return res.status(201).json({
        success: true,
        parsedActions,
        createdEntries,
        updatedDashboard,
        coachReply,
        parsingFlags,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Convert parsed action to FitnessEntry data format
   */
  convertActionToEntryData(action) {
    const data = action.extractedData || {};

    switch (action.actionType) {
      case 'meal':
        return {
          calories: data.calories || 0,
          protein: data.protein || 0,
          carbs: data.carbs || undefined,
          fat: data.fat || undefined,
          description: data.description || data.food || 'meal',
          timestamp: new Date(),
        };

      case 'workout':
        return {
          duration: data.duration || 0,
          workoutType: data.type || 'workout',
          intensity: data.intensity || 'moderate',
          caloriesBurned: data.caloriesBurned || 0,
          notes: `Parsed from chat input`,
          timestamp: new Date(),
        };

      case 'sleep':
        return {
          duration: data.duration || 0,
          sleepQuality: data.sleepQuality || undefined,
          timestamp: new Date(),
        };

      case 'hydration':
        return {
          volumeMl: data.volumeMl || 0,
          timestamp: new Date(),
        };

      case 'activity':
        return {
          duration: data.duration || 0,
          activityType: data.activityType || 'activity',
          steps: data.steps || undefined,
          caloriesBurned: data.caloriesBurned || undefined,
          timestamp: new Date(),
        };

      case 'recovery':
        return {
          recoveryQuality: data.recoveryQuality || undefined,
          heartRateVariability: data.heartRateVariability || undefined,
          restingHeartRate: data.restingHeartRate || undefined,
          notes: `Parsed from chat input`,
          timestamp: new Date(),
        };

      default:
        return { timestamp: new Date() };
    }
  },
};

module.exports = fitnessChatInputController;
