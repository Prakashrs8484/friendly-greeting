const FitnessEntry = require('../models/FitnessEntry');
const FitnessMeal = require('../models/FitnessMeal');
const FitnessActivity = require('../models/FitnessActivity');
const FitnessDailyStats = require('../models/FitnessDailyStats');
const FitnessGoals = require('../models/FitnessGoals');
const fitnessDailyMetricService = require('./fitnessDailyMetric.service');
const fitnessAnalyticsService = require('./fitnessAnalytics.service');
const {
  findFoodNutrition,
  findActivityBurnRate,
} = require('../data/calorieLookup.data');

function normalizeDateKey(dateValue = new Date()) {
  return new Date(dateValue).toISOString().split('T')[0];
}

function toMinutes(duration, unit) {
  const value = Number(duration) || 0;
  const normalized = String(unit || 'minutes').toLowerCase();

  if (normalized.startsWith('hour') || normalized === 'hr' || normalized === 'hrs') {
    return Math.round(value * 60);
  }

  return Math.round(value);
}

const healthEngineService = {
  async processEvents({ userId, rawText, events, dateKey, timestamp }) {
    const effectiveDateKey = dateKey || normalizeDateKey(timestamp);
    const eventTime = timestamp ? new Date(timestamp) : new Date();
    const normalizedEvents = Array.isArray(events) ? events : [];

    const created = [];
    const processedEvents = [];

    for (const event of normalizedEvents) {
      if (!event || typeof event !== 'object' || !event.type) {
        continue;
      }

      if (event.type === 'meal_log') {
        const quantity = Number(event.quantity) || 0;
        if (quantity <= 0) continue;

        const lookup = findFoodNutrition(event.food, event.unit);
        const calories = Math.round(quantity * lookup.perUnit.calories);
        const protein = Number((quantity * lookup.perUnit.protein).toFixed(1));
        const carbs = Number((quantity * lookup.perUnit.carbs).toFixed(1));
        const fats = Number((quantity * lookup.perUnit.fats).toFixed(1));

        const meal = await FitnessMeal.create({
          userId,
          dateKey: effectiveDateKey,
          timestamp: eventTime,
          food: event.food,
          quantity,
          unit: event.unit,
          calories,
          protein,
          carbs,
          fats,
          sourceCommand: rawText,
          metadata: {
            matchedFoodKey: lookup.key,
            nutritionPerUnit: lookup.perUnit,
            resolvedUnit: lookup.resolvedUnit,
            parserType: 'dual_response_chat',
          },
        });

        const timelineEntry = await FitnessEntry.create({
          userId,
          entryType: 'meal',
          dateKey: effectiveDateKey,
          timestamp: eventTime,
          description: `${quantity} ${event.unit} ${event.food}`.trim(),
          source: 'chat',
          aiEstimated: true,
          calories,
          protein,
          carbs,
          fat: fats,
          metadata: {
            commandType: 'meal_log',
            mealId: meal._id,
            parserType: 'dual_response_chat',
          },
        });

        created.push({ meal, timelineEntry });
        processedEvents.push({
          type: 'meal_log',
          food: event.food,
          quantity,
          unit: event.unit,
          calories,
          protein,
          carbs,
          fats,
        });
        continue;
      }

      if (event.type === 'activity_log') {
        const duration = Number(event.duration) || 0;
        if (duration <= 0) continue;

        const lookup = findActivityBurnRate(event.activity);
        const durationMinutes = toMinutes(duration, event.unit);
        const caloriesBurned = Math.round(durationMinutes * lookup.caloriesPerMinute);

        const activity = await FitnessActivity.create({
          userId,
          dateKey: effectiveDateKey,
          timestamp: eventTime,
          activity: event.activity,
          duration,
          unit: event.unit,
          caloriesBurned,
          sourceCommand: rawText,
          metadata: {
            matchedActivityKey: lookup.key,
            caloriesPerMinute: lookup.caloriesPerMinute,
            durationMinutes,
            parserType: 'dual_response_chat',
          },
        });

        const timelineEntry = await FitnessEntry.create({
          userId,
          entryType: 'activity',
          dateKey: effectiveDateKey,
          timestamp: eventTime,
          description: `${event.activity} for ${duration} ${event.unit}`.trim(),
          source: 'chat',
          aiEstimated: true,
          activityType: event.activity,
          duration: durationMinutes,
          caloriesBurned,
          metadata: {
            commandType: 'activity_log',
            activityId: activity._id,
            parserType: 'dual_response_chat',
          },
        });

        created.push({ activity, timelineEntry });
        processedEvents.push({
          type: 'activity_log',
          activity: event.activity,
          food: event.activity,
          duration,
          quantity: duration,
          unit: event.unit,
          caloriesBurned,
          durationMinutes,
        });
      }
    }

    const updatedDailyStats = await this.recomputeDailyStats(userId, effectiveDateKey);
    const dailyMetric = await fitnessDailyMetricService.recomputeDailyMetrics(userId, effectiveDateKey);
    const dashboard = await fitnessDailyMetricService.getDashboardPayload(userId);
    const timeline = await FitnessEntry.find({ userId, dateKey: effectiveDateKey })
      .sort({ timestamp: 1 })
      .lean();

    let weeklyAnalytics = null;
    try {
      weeklyAnalytics = await fitnessAnalyticsService.getWeeklyAnalytics(userId, effectiveDateKey);
    } catch (error) {
      console.error('Failed to refresh weekly analytics after chat events:', error.message);
    }

    return {
      processedEvents,
      created,
      updatedDailyStats,
      dailyMetric,
      dashboard,
      timeline,
      weeklyAnalytics,
    };
  },

  async processCommand({ userId, rawText, parsedCommand, dateKey, timestamp }) {
    const result = await this.processEvents({
      userId,
      rawText,
      events: [parsedCommand],
      dateKey,
      timestamp,
    });

    const event = result.processedEvents[0] || {
      type: parsedCommand.type,
      rawText,
      timestamp: new Date(timestamp || Date.now()).toISOString(),
      intakeCalories: 0,
      burnedCalories: 0,
      netCalories: 0,
    };

    const intakeCalories = event.calories || 0;
    const burnedCalories = event.caloriesBurned || 0;
    const netCalories = intakeCalories - burnedCalories;

    return {
      parsedCommand,
      event: {
        type: event.type || parsedCommand.type,
        rawText,
        timestamp: new Date(timestamp || Date.now()).toISOString(),
        intakeCalories,
        burnedCalories,
        netCalories,
      },
      created: {
        meal: result.created.find((item) => item.meal)?.meal || null,
        activity: result.created.find((item) => item.activity)?.activity || null,
        timelineEntry: result.created.find((item) => item.timelineEntry)?.timelineEntry || null,
      },
      collections: {
        mealsCollection: 'FitnessMeal',
        activitiesCollection: 'FitnessActivity',
        dailyStatsCollection: 'FitnessDailyStats',
      },
      dailyStats: result.updatedDailyStats,
      dailyMetric: result.dailyMetric,
      dashboard: result.dashboard,
      timeline: result.timeline,
      weeklyAnalytics: result.weeklyAnalytics,
    };
  },

  async recomputeDailyStats(userId, dateKey) {
    const [mealTotals, activityTotals] = await Promise.all([
      FitnessMeal.aggregate([
        { $match: { userId, dateKey } },
        {
          $group: {
            _id: null,
            intakeCalories: { $sum: '$calories' },
            intakeProtein: { $sum: '$protein' },
            intakeCarbs: { $sum: '$carbs' },
            intakeFats: { $sum: '$fats' },
            mealCount: { $sum: 1 },
          },
        },
      ]),
      FitnessActivity.aggregate([
        { $match: { userId, dateKey } },
        {
          $group: {
            _id: null,
            burnedCalories: { $sum: '$caloriesBurned' },
            activityCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const intakeCalories = Math.round(mealTotals[0]?.intakeCalories || 0);
    const intakeProtein = Number((mealTotals[0]?.intakeProtein || 0).toFixed(1));
    const intakeCarbs = Number((mealTotals[0]?.intakeCarbs || 0).toFixed(1));
    const intakeFats = Number((mealTotals[0]?.intakeFats || 0).toFixed(1));
    const burnedCalories = Math.round(activityTotals[0]?.burnedCalories || 0);
    const mealCount = mealTotals[0]?.mealCount || 0;
    const activityCount = activityTotals[0]?.activityCount || 0;
    const netCalories = intakeCalories - burnedCalories;
    const goals = await FitnessGoals.findOne({ userId });
    const calorieTarget = goals?.targets?.calories || 2000;
    const deficitCalories = calorieTarget - netCalories;

    return FitnessDailyStats.findOneAndUpdate(
      { userId, dateKey },
      {
        userId,
        dateKey,
        intakeCalories,
        intakeProtein,
        intakeCarbs,
        intakeFats,
        burnedCalories,
        netCalories,
        deficitCalories,
        calorieTarget,
        mealCount,
        activityCount,
        lastUpdatedAt: new Date(),
      },
      { new: true, upsert: true }
    );
  },
};

module.exports = healthEngineService;
