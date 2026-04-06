const FitnessDailyMetric = require('../models/FitnessDailyMetric');
const FitnessEntry = require('../models/FitnessEntry');
const FitnessGoals = require('../models/FitnessGoals');

const fitnessAnalyticsService = {
  /**
   * Get weekly analytics for a 7-day period ending on endDate
   * @param {string} userId - User ID
   * @param {string} endDate - End date in 'YYYY-MM-DD' format
   * @returns {object} Weekly summary with totals, averages, and daily breakdown
   */
  async getWeeklyAnalytics(userId, endDate) {
    const endDateObj = new Date(endDate);
    const startDateObj = new Date(endDateObj);
    startDateObj.setDate(startDateObj.getDate() - 6); // 7 days including endDate

    const startDate = startDateObj.toISOString().split('T')[0];

    // Fetch or compute metrics for all 7 days
    const dailyMetrics = await this.getOrComputeMetrics(userId, startDate, endDate);

    // Calculate weekly summary
    const weeklySummary = this.calculateWeeklySummary(dailyMetrics);

    // Calculate deficit/surplus trend (assumes 2000 cal goal, adjustable)
    const goals = await FitnessGoals.findOne({ userId });
    const calorieGoal = goals?.targets?.calories || 2000;

    const deficitSurplusTrend = dailyMetrics.map((metric) => ({
      dateKey: metric.dateKey,
      deficit: calorieGoal - metric.caloriesConsumed, // Positive = deficit (ate less), Negative = surplus
      net: metric.caloriesBurned - metric.caloriesConsumed, // Net loss/gain
    }));

    return {
      success: true,
      period: {
        startDate,
        endDate,
        days: 7,
      },
      daily: dailyMetrics,
      weekly: weeklySummary,
      deficitSurplus: deficitSurplusTrend,
      trends: {
        consumed: dailyMetrics.map((m) => m.caloriesConsumed),
        burned: dailyMetrics.map((m) => m.caloriesBurned),
        protein: dailyMetrics.map((m) => m.proteinIntake),
        workoutMinutes: dailyMetrics.map((m) => m.workoutMinutes),
        sleepHours: dailyMetrics.map((m) => m.sleepHours),
      },
    };
  },

  /**
   * Get trend analytics across a custom date range
   * @param {string} userId - User ID
   * @param {string} fromDate - Start date in 'YYYY-MM-DD' format
   * @param {string} toDate - End date in 'YYYY-MM-DD' format
   * @returns {object} Trend data with consumed/burned/protein/workout/sleep trends
   */
  async getTrendAnalytics(userId, fromDate, toDate) {
    // Validate dates
    const from = new Date(fromDate);
    const to = new Date(toDate);

    if (from > to) {
      throw new Error('fromDate must be before toDate');
    }

    const dayCount = Math.floor((to - from) / (1000 * 60 * 60 * 24)) + 1;

    if (dayCount > 365) {
      throw new Error('Date range cannot exceed 365 days');
    }

    // Fetch or compute metrics for date range
    const dailyMetrics = await this.getOrComputeMetrics(userId, fromDate, toDate);

    // Get user goals for surplus/deficit calculation
    const goals = await FitnessGoals.findOne({ userId });
    const targets = goals?.targets || {
      calories: 2000,
      protein: 150,
      water: 2000,
      workoutMinutes: 30,
      sleepHours: 8,
    };

    // Calculate summary statistics
    const summary = this.calculateTrendSummary(dailyMetrics, targets);

    // Build trend arrays
    const trends = {
      dates: dailyMetrics.map((m) => m.dateKey),
      consumed: dailyMetrics.map((m) => m.caloriesConsumed),
      burned: dailyMetrics.map((m) => m.caloriesBurned),
      protein: dailyMetrics.map((m) => m.proteinIntake),
      workoutMinutes: dailyMetrics.map((m) => m.workoutMinutes),
      sleepHours: dailyMetrics.map((m) => m.sleepHours),
      water: dailyMetrics.map((m) => m.waterIntakeMl),
      recoveryScore: dailyMetrics.map((m) => m.recoveryScore || 0),
      fitnessScore: dailyMetrics.map((m) => m.fitnessScore || 0),
    };

    // Calculate deficit/surplus per day
    const deficitSurplus = dailyMetrics.map((metric) => ({
      dateKey: metric.dateKey,
      deficit: targets.calories - metric.caloriesConsumed,
      net: metric.caloriesBurned - metric.caloriesConsumed,
    }));

    return {
      success: true,
      period: {
        fromDate,
        toDate,
        dayCount,
      },
      summary,
      daily: dailyMetrics,
      trends,
      deficitSurplus,
    };
  },

  /**
   * Fetch metrics for date range, computing missing ones on demand from FitnessEntry
   */
  async getOrComputeMetrics(userId, startDate, endDate) {
    const metrics = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);

    while (currentDate <= endDateObj) {
      const dateKey = currentDate.toISOString().split('T')[0];

      // Check if metric exists
      let metric = await FitnessDailyMetric.findOne({ userId, dateKey });

      // If not found, compute from entries
      if (!metric) {
        metric = await this.computeMetricFromEntries(userId, dateKey);
      }

      metrics.push(metric);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return metrics;
  },

  /**
   * Compute a metric from FitnessEntry records and upsert
   */
  async computeMetricFromEntries(userId, dateKey) {
    const entries = await FitnessEntry.find({ userId, dateKey });

    // Initialize metric with zeros
    let metric = {
      userId,
      dateKey,
      caloriesConsumed: 0,
      caloriesBurned: 0,
      proteinIntake: 0,
      carbsIntake: 0,
      fatIntake: 0,
      waterIntakeMl: 0,
      workoutMinutes: 0,
      sleepHours: 0,
      recoveryScore: 50,
      fitnessScore: 50,
      streakCount: 0,
      entryCount: entries.length,
      lastComputedAt: new Date(),
    };

    // Aggregate from entries
    let mealCount = 0;
    let workoutCount = 0;
    let sleepCount = 0;
    let hydrationCount = 0;

    for (const entry of entries) {
      if (entry.entryType === 'meal') {
        metric.caloriesConsumed += entry.calories || 0;
        metric.proteinIntake += entry.protein || 0;
        metric.carbsIntake += entry.carbs || 0;
        metric.fatIntake += entry.fat || 0;
        mealCount++;
      } else if (entry.entryType === 'workout') {
        metric.workoutMinutes += entry.duration || 0;
        metric.caloriesBurned += entry.caloriesBurned || 0;
        workoutCount++;
      } else if (entry.entryType === 'activity') {
        metric.workoutMinutes += entry.duration || 0;
        metric.caloriesBurned += entry.caloriesBurned || 0;
        workoutCount++;
      } else if (entry.entryType === 'sleep') {
        metric.sleepHours += entry.duration || 0;
        sleepCount++;
      } else if (entry.entryType === 'hydration') {
        metric.waterIntakeMl += entry.volumeMl || 0;
        hydrationCount++;
      }
    }

    // Only update if entries exist
    if (entries.length > 0) {
      // Upsert into FitnessDailyMetric
      const upserted = await FitnessDailyMetric.findOneAndUpdate(
        { userId, dateKey },
        metric,
        { upsert: true, new: true }
      );
      return upserted;
    }

    return metric;
  },

  /**
   * Calculate weekly summary (totals and averages)
   */
  calculateWeeklySummary(dailyMetrics) {
    const nonZeroDays = dailyMetrics.filter((m) => m.caloriesConsumed > 0 || m.workoutMinutes > 0).length;

    return {
      totalCaloriesConsumed: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.caloriesConsumed || 0), 0)
      ),
      totalCaloriesBurned: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.caloriesBurned || 0), 0)
      ),
      totalProtein: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.proteinIntake || 0), 0)
      ),
      totalWater: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.waterIntakeMl || 0), 0)
      ),
      totalWorkoutMinutes: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.workoutMinutes || 0), 0)
      ),
      totalSleepHours: parseFloat(
        (dailyMetrics.reduce((sum, m) => sum + (m.sleepHours || 0), 0) / 7).toFixed(1)
      ),
      averageCaloriesConsumed: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.caloriesConsumed || 0), 0) / 7
      ),
      averageCaloriesBurned: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.caloriesBurned || 0), 0) / 7
      ),
      averageProtein: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.proteinIntake || 0), 0) / 7
      ),
      averageWater: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.waterIntakeMl || 0), 0) / 7
      ),
      averageWorkoutMinutes: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.workoutMinutes || 0), 0) / 7
      ),
      averageSleepHours: parseFloat(
        (dailyMetrics.reduce((sum, m) => sum + (m.sleepHours || 0), 0) / 7).toFixed(1)
      ),
      averageRecoveryScore: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.recoveryScore || 0), 0) / 7
      ),
      averageFitnessScore: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.fitnessScore || 0), 0) / 7
      ),
      daysWithLogging: nonZeroDays,
      consistencyPercent: Math.round((nonZeroDays / 7) * 100),
    };
  },

  /**
   * Calculate trend summary across entire date range
   */
  calculateTrendSummary(dailyMetrics, targets) {
    const nonZeroDays = dailyMetrics.filter((m) => m.caloriesConsumed > 0 || m.workoutMinutes > 0).length;
    const dayCount = dailyMetrics.length;

    // Calculate total deficit/surplus
    let totalDeficit = 0;
    dailyMetrics.forEach((metric) => {
      const deficit = targets.calories - metric.caloriesConsumed;
      totalDeficit += deficit;
    });

    // Calculate average net (burned - consumed)
    const totalNet = dailyMetrics.reduce((sum, m) => sum + (m.caloriesBurned - m.caloriesConsumed), 0);
    const averageNet = Math.round(totalNet / dayCount);

    // Goal achievement rates
    const metricsMetTarget = {
      protein: dailyMetrics.filter((m) => m.proteinIntake >= targets.protein).length,
      water: dailyMetrics.filter((m) => m.waterIntakeMl >= targets.water).length,
      workout: dailyMetrics.filter((m) => m.workoutMinutes >= targets.workoutMinutes).length,
      sleep: dailyMetrics.filter((m) => m.sleepHours >= targets.sleepHours).length,
    };

    return {
      dayCount,
      daysWithLogging: nonZeroDays,
      consistencyPercent: Math.round((nonZeroDays / dayCount) * 100),
      totalCaloriesConsumed: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.caloriesConsumed || 0), 0)
      ),
      totalCaloriesBurned: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.caloriesBurned || 0), 0)
      ),
      totalProtein: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.proteinIntake || 0), 0)
      ),
      totalWorkoutMinutes: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.workoutMinutes || 0), 0)
      ),
      averageCaloriesConsumed: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.caloriesConsumed || 0), 0) / dayCount
      ),
      averageCaloriesBurned: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.caloriesBurned || 0), 0) / dayCount
      ),
      averageProtein: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.proteinIntake || 0), 0) / dayCount
      ),
      averageWorkoutMinutes: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.workoutMinutes || 0), 0) / dayCount
      ),
      averageSleepHours: parseFloat(
        (dailyMetrics.reduce((sum, m) => sum + (m.sleepHours || 0), 0) / dayCount).toFixed(1)
      ),
      averageRecoveryScore: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.recoveryScore || 0), 0) / dayCount
      ),
      averageFitnessScore: Math.round(
        dailyMetrics.reduce((sum, m) => sum + (m.fitnessScore || 0), 0) / dayCount
      ),
      totalDeficit: Math.round(totalDeficit),
      averageNetCalories: averageNet,
      goalsMetTarget: {
        protein: `${metricsMetTarget.protein}/${dayCount}`,
        proteinPercent: Math.round((metricsMetTarget.protein / dayCount) * 100),
        water: `${metricsMetTarget.water}/${dayCount}`,
        waterPercent: Math.round((metricsMetTarget.water / dayCount) * 100),
        workout: `${metricsMetTarget.workout}/${dayCount}`,
        workoutPercent: Math.round((metricsMetTarget.workout / dayCount) * 100),
        sleep: `${metricsMetTarget.sleep}/${dayCount}`,
        sleepPercent: Math.round((metricsMetTarget.sleep / dayCount) * 100),
      },
    };
  },
};

module.exports = fitnessAnalyticsService;
