const FitnessEntry = require('../models/FitnessEntry');
const FitnessDailyMetric = require('../models/FitnessDailyMetric');
const FitnessProfile = require('../models/FitnessProfile');

const fitnessDailyMetricService = {
  /**
   * Recompute all daily metrics for a user on a specific date based on FitnessEntry records
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {object} Computed daily metric
   */
  async recomputeDailyMetrics(userId, dateKey) {
    // Fetch all entries for this user on this date
    const entries = await FitnessEntry.find({
      userId,
      dateKey,
    });

    // Calculate individual metrics from entries
    let caloriesConsumed = 0;
    let caloriesBurned = 0;
    let proteinIntake = 0;
    let carbsIntake = 0;
    let fatIntake = 0;
    let waterIntakeMl = 0;
    let workoutMinutes = 0;
    let sleepHours = 0;
    let recoveryScores = [];

    for (const entry of entries) {
      switch (entry.entryType) {
        case 'meal':
          caloriesConsumed += entry.calories || 0;
          proteinIntake += entry.protein || 0;
          carbsIntake += entry.carbs || 0;
          fatIntake += entry.fat || 0;
          break;
        case 'workout':
          caloriesBurned += entry.caloriesBurned || 0;
          workoutMinutes += entry.duration || 0;
          break;
        case 'activity':
          caloriesBurned += entry.caloriesBurned || 0;
          workoutMinutes += entry.duration || 0;
          break;
        case 'hydration':
          waterIntakeMl += entry.volumeMl || 0;
          break;
        case 'sleep':
          sleepHours += entry.duration || 0;
          break;
        case 'recovery':
          if (entry.recoveryQuality) {
            recoveryScores.push(entry.recoveryQuality);
          }
          break;
      }
    }

    // Calculate recovery score (0-100 scale)
    let recoveryScore = 0;
    if (recoveryScores.length > 0) {
      const avgRecoveryQuality = recoveryScores.reduce((a, b) => a + b, 0) / recoveryScores.length;
      recoveryScore = Math.round((avgRecoveryQuality / 10) * 100);
    }

    // Get user profile for goal-based calculations
    let profile = await FitnessProfile.findOne({ userId });
    if (!profile) {
      // Create default profile if it doesn't exist
      profile = new FitnessProfile({ userId });
      await profile.save();
    }

    // Calculate fitness score (0-100 scale)
    const fitnessScore = this.calculateFitnessScore(
      workoutMinutes,
      recoveryScore,
      sleepHours,
      profile
    );

    // Calculate streak count (consecutive days with workoutMinutes > 0)
    const streakCount = await this.calculateStreak(userId, dateKey);

    // Prepare metadata
    const metadata = {
      mealEntriesCount: entries.filter((e) => e.entryType === 'meal').length,
      workoutEntriesCount: entries.filter((e) => e.entryType === 'workout').length,
      activityEntriesCount: entries.filter((e) => e.entryType === 'activity').length,
      sleepEntriesCount: entries.filter((e) => e.entryType === 'sleep').length,
      hydrationEntriesCount: entries.filter((e) => e.entryType === 'hydration').length,
      recoveryEntriesCount: entries.filter((e) => e.entryType === 'recovery').length,
    };

    const netCalories = caloriesConsumed - caloriesBurned;

    // Upsert the daily metric
    const metric = await FitnessDailyMetric.findOneAndUpdate(
      { userId, dateKey },
      {
        userId,
        dateKey,
        caloriesConsumed,
        caloriesBurned,
        netCalories,
        proteinIntake,
        carbsIntake,
        fatIntake,
        waterIntakeMl,
        workoutMinutes,
        sleepHours,
        recoveryScore,
        fitnessScore,
        streakCount,
        metadata,
        lastComputedAt: new Date(),
      },
      { upsert: true, new: true, runValidators: false }
    );

    return metric;
  },

  /**
   * Calculate fitness score based on multiple factors
   * @param {number} workoutMinutes - Minutes exercised
   * @param {number} recoveryScore - Recovery quality score (0-100)
   * @param {number} sleepHours - Hours slept
   * @param {object} profile - User fitness profile with goals
   * @returns {number} Fitness score (0-100)
   */
  calculateFitnessScore(workoutMinutes, recoveryScore, sleepHours, profile) {
    // Workout adherence (based on daily goal derived from weekly goal)
    const dailyWorkoutGoal = profile.weeklyWorkoutMinutesGoal / 7;
    const workoutAdhereance = Math.min((workoutMinutes / dailyWorkoutGoal) * 100, 100);

    // Sleep adequacy
    const sleepAdhereance = Math.min((sleepHours / profile.dailySleepGoal) * 100, 100);

    // Weighted components
    const weights = {
      workout: 0.4,
      recovery: 0.3,
      sleep: 0.3,
    };

    const fitnessScore =
      workoutAdhereance * weights.workout +
      recoveryScore * weights.recovery +
      sleepAdhereance * weights.sleep;

    return Math.round(Math.min(fitnessScore, 100));
  },

  /**
   * Calculate consecutive day workout streak ending on a specific date
   * @param {string} userId - User ID
   * @param {string} dateKey - End date in 'YYYY-MM-DD' format
   * @returns {number} Streak count
   */
  async calculateStreak(userId, dateKey) {
    let streak = 0;
    let currentDate = new Date(dateKey + 'T00:00:00Z');

    // Query backwards from the target date
    while (true) {
      const dateKeyStr = currentDate.toISOString().split('T')[0];
      const dayMetric = await FitnessDailyMetric.findOne({
        userId,
        dateKey: dateKeyStr,
      });

      // If we find a day with workout minutes > 0, continue the streak
      if (dayMetric && dayMetric.workoutMinutes > 0) {
        streak++;
      } else {
        // Check if no entries exist for this date
        const entryCount = await FitnessEntry.countDocuments({
          userId,
          dateKey: dateKeyStr,
        });
        if (entryCount === 0) {
          // Day has no entries, streak ends
          break;
        }
        // Day has entries but no workouts, streak ends
        break;
      }

      // Move to previous day
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  },

  /**
   * Get a precomputed daily metric
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {object} Daily metric or null
   */
  async getDailyMetric(userId, dateKey) {
    return await FitnessDailyMetric.findOne({
      userId,
      dateKey,
    });
  },

  /**
   * Get metrics for a date range
   * @param {string} userId - User ID
   * @param {string} startDate - Start date in 'YYYY-MM-DD' format
   * @param {string} endDate - End date in 'YYYY-MM-DD' format
   * @returns {array} Array of metrics
   */
  async getMetricsRange(userId, startDate, endDate) {
    return await FitnessDailyMetric.find({
      userId,
      dateKey: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ dateKey: -1 });
  },

  /**
   * Get dashboard payload with aggregated metrics
   * @param {string} userId - User ID
   * @returns {object} Dashboard payload
   */
  async getDashboardPayload(userId) {
    // Today's date
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    // Get today's metric
    const todayMetric = await FitnessDailyMetric.findOne({
      userId,
      dateKey: todayKey,
    });

    // Get last 7 days metrics
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoKey = sevenDaysAgo.toISOString().split('T')[0];

    const lastSevenDaysMetrics = await FitnessDailyMetric.find({
      userId,
      dateKey: {
        $gte: sevenDaysAgoKey,
        $lte: todayKey,
      },
    }).sort({ dateKey: -1 });

    // Get user profile
    let profile = await FitnessProfile.findOne({ userId });
    if (!profile) {
      profile = new FitnessProfile({ userId });
      await profile.save();
    }

    // Calculate weekly aggregates
    const weeklyStats = {
      totalCaloriesConsumed: 0,
      totalCaloriesBurned: 0,
      totalNetCalories: 0,
      totalProteinIntake: 0,
      totalCarbsIntake: 0,
      totalFatIntake: 0,
      totalWaterIntakeMl: 0,
      totalWorkoutMinutes: 0,
      averageSleepHours: 0,
      averageRecoveryScore: 0,
      averageFitnessScore: 0,
    };

    if (lastSevenDaysMetrics.length > 0) {
      lastSevenDaysMetrics.forEach((metric) => {
        weeklyStats.totalCaloriesConsumed += metric.caloriesConsumed;
        weeklyStats.totalCaloriesBurned += metric.caloriesBurned;
        weeklyStats.totalNetCalories += metric.netCalories || metric.caloriesConsumed - metric.caloriesBurned;
        weeklyStats.totalProteinIntake += metric.proteinIntake;
        weeklyStats.totalCarbsIntake += metric.carbsIntake || 0;
        weeklyStats.totalFatIntake += metric.fatIntake || 0;
        weeklyStats.totalWaterIntakeMl += metric.waterIntakeMl;
        weeklyStats.totalWorkoutMinutes += metric.workoutMinutes;
        weeklyStats.averageSleepHours += metric.sleepHours;
        weeklyStats.averageRecoveryScore += metric.recoveryScore;
        weeklyStats.averageFitnessScore += metric.fitnessScore;
      });

      weeklyStats.averageSleepHours = Math.round(
        (weeklyStats.averageSleepHours / lastSevenDaysMetrics.length) * 10
      ) / 10;
      weeklyStats.averageRecoveryScore = Math.round(
        weeklyStats.averageRecoveryScore / lastSevenDaysMetrics.length
      );
      weeklyStats.averageFitnessScore = Math.round(
        weeklyStats.averageFitnessScore / lastSevenDaysMetrics.length
      );
    }

    // Get current streak
    const currentStreak = todayMetric ? todayMetric.streakCount : 0;

    // Calculate progress toward goals
    const progressTowardGoals = {
      calorieConsumption: {
        current: todayMetric?.caloriesConsumed || 0,
        goal: profile.dailyCalorieGoal,
        percentage:
          Math.round(
            ((todayMetric?.caloriesConsumed || 0) / profile.dailyCalorieGoal) * 100
          ) || 0,
      },
      protein: {
        current: todayMetric?.proteinIntake || 0,
        goal: profile.dailyProteinGoal,
        percentage:
          Math.round(
            ((todayMetric?.proteinIntake || 0) / profile.dailyProteinGoal) * 100
          ) || 0,
      },
      water: {
        current: todayMetric?.waterIntakeMl || 0,
        goal: profile.dailyWaterGoal,
        percentage:
          Math.round(((todayMetric?.waterIntakeMl || 0) / profile.dailyWaterGoal) * 100) ||
          0,
      },
      workout: {
        current: todayMetric?.workoutMinutes || 0,
        goal: Math.round(profile.weeklyWorkoutMinutesGoal / 7),
        percentage:
          Math.round(
            ((todayMetric?.workoutMinutes || 0) / (profile.weeklyWorkoutMinutesGoal / 7)) *
              100
          ) || 0,
      },
      sleep: {
        current: todayMetric?.sleepHours || 0,
        goal: profile.dailySleepGoal,
        percentage:
          Math.round(
            ((todayMetric?.sleepHours || 0) / profile.dailySleepGoal) * 100
          ) || 0,
      },
      recovery: {
        current: todayMetric?.recoveryScore || 0,
        goal: profile.recoveryTargetScore,
        percentage:
          Math.round(((todayMetric?.recoveryScore || 0) / profile.recoveryTargetScore) * 100) ||
          0,
      },
    };

    return {
      today: todayMetric || null,
      lastSevenDays: lastSevenDaysMetrics,
      weeklyStats,
      currentStreak,
      progressTowardGoals,
      profile,
    };
  },
};

module.exports = fitnessDailyMetricService;
