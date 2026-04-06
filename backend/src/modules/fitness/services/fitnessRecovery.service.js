const FitnessRecoverySignals = require('../models/FitnessRecoverySignals');
const FitnessDailyMetric = require('../models/FitnessDailyMetric');
const FitnessEntry = require('../models/FitnessEntry');
const FitnessGoals = require('../models/FitnessGoals');

const fitnessRecoveryService = {
  /**
   * Add or update recovery signals for a user on a specific date
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @param {object} signals - Recovery signals (muscleSoreness, stressLevel, restingHeartRate, injuryNotes, energyLevel, moodScore)
   * @returns {object} Created or updated recovery signals
   */
  async addRecoverySignals(userId, dateKey, signals) {
    const timestamp = new Date();

    const recoverySignals = await FitnessRecoverySignals.findOneAndUpdate(
      { userId, dateKey },
      {
        userId,
        dateKey,
        timestamp,
        ...signals,
      },
      { upsert: true, new: true, runValidators: true }
    );

    return recoverySignals;
  },

  /**
   * Get comprehensive recovery data for a user on a specific date
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {object} Recovery data with score and recommendations
   */
  async getRecoveryData(userId, dateKey) {
    // Fetch recovery signals for this date
    const signals = await FitnessRecoverySignals.findOne({ userId, dateKey });

    // Fetch daily metrics
    const metric = await FitnessDailyMetric.findOne({ userId, dateKey });

    // Fetch training load (workout entries)
    const workoutEntries = await FitnessEntry.find({
      userId,
      dateKey,
      entryType: { $in: ['workout', 'activity'] },
    });

    // Fetch goals
    const goals = await FitnessGoals.findOne({ userId });

    // Calculate components
    const sleepQuality = this.calculateSleepQuality(metric);
    const hydrationLevel = this.calculateHydrationLevel(metric, goals);
    const trainingLoad = this.calculateTrainingLoad(workoutEntries);
    const recoveryScore = this.calculateRecoveryScore(
      signals,
      metric,
      sleepQuality,
      hydrationLevel,
      trainingLoad
    );

    // Generate recommendations based on actual values
    const recommendations = this.generateRecommendations(
      signals,
      metric,
      sleepQuality,
      hydrationLevel,
      trainingLoad,
      recoveryScore,
      goals
    );

    return {
      dateKey,
      recoveryScore,
      components: {
        sleepQuality,
        hydrationLevel,
        trainingLoad,
        muscleSoreness: signals?.muscleSoreness || null,
        stressLevel: signals?.stressLevel || null,
        restingHeartRate: signals?.restingHeartRate || null,
        energyLevel: signals?.energyLevel || null,
        moodScore: signals?.moodScore || null,
      },
      signals: signals || null,
      recommendations,
      timestamp: new Date(),
    };
  },

  /**
   * Calculate sleep quality score (0-100)
   * Based on actual sleep hours vs target (8 hours)
   */
  calculateSleepQuality(metric) {
    if (!metric || metric.sleepHours === 0) {
      return 0;
    }

    const targetSleep = 8;
    const actualSleep = metric.sleepHours;

    // Normalize: 8 hours = 100, less/more deviation reduces score
    if (actualSleep >= targetSleep) {
      // Cap at 100 if meets target
      return Math.min(100, Math.round((actualSleep / targetSleep) * 100));
    }

    // Below target, penalize more heavily
    return Math.round((actualSleep / targetSleep) * 100);
  },

  /**
   * Calculate hydration level (0-100)
   * Based on actual water intake vs daily goal
   */
  calculateHydrationLevel(metric, goals) {
    if (!metric || metric.waterIntakeMl === 0) {
      return 0;
    }

    const targetWater = (goals?.targets?.water) || 2000;
    const actualWater = metric.waterIntakeMl;

    // 100% when meets or exceeds target
    return Math.min(100, Math.round((actualWater / targetWater) * 100));
  },

  /**
   * Calculate training load (0-100 scale)
   * Based on workout minutes and intensity
   */
  calculateTrainingLoad(workoutEntries) {
    if (!workoutEntries || workoutEntries.length === 0) {
      return 0;
    }

    let totalMinutes = 0;
    let totalCalories = 0;

    for (const entry of workoutEntries) {
      totalMinutes += entry.duration || 0;
      totalCalories += entry.caloriesBurned || 0;
    }

    // Training load: normalize based on typical daily targets
    // 60 min of workout = 100 load (very intense), 30 min = 50, 0 min = 0
    const minuteLoad = Math.min(100, Math.round((totalMinutes / 60) * 100));

    // Also consider calorie expenditure (500+ kcal = high load)
    const calorieLoad = Math.min(100, Math.round((totalCalories / 500) * 100));

    // Average both factors
    return Math.round((minuteLoad + calorieLoad) / 2);
  },

  /**
   * Calculate overall recovery score (0-100)
   * Composite of sleep, hydration, low soreness, low stress, normal HR, training balance
   */
  calculateRecoveryScore(signals, metric, sleepQuality, hydrationLevel, trainingLoad) {
    let components = [];

    // Sleep component (25%)
    components.push({ weight: 0.25, value: sleepQuality });

    // Hydration component (15%)
    components.push({ weight: 0.15, value: hydrationLevel });

    // Muscle soreness component (20%) - lower soreness is better
    if (signals?.muscleSoreness) {
      // Invert: 1 = best (100), 10 = worst (0)
      const sorenessScore = Math.round(((10 - signals.muscleSoreness) / 9) * 100);
      components.push({ weight: 0.2, value: sorenessScore });
    } else {
      components.push({ weight: 0.2, value: 50 }); // neutral if not provided
    }

    // Stress level component (15%) - lower stress is better
    if (signals?.stressLevel) {
      // Invert: 1 = best (100), 10 = worst (0)
      const stressScore = Math.round(((10 - signals.stressLevel) / 9) * 100);
      components.push({ weight: 0.15, value: stressScore });
    } else {
      components.push({ weight: 0.15, value: 50 }); // neutral if not provided
    }

    // Resting heart rate component (10%) - lower is generally better (less stress response)
    if (signals?.restingHeartRate) {
      // Normal RHR is 60-100 bpm, lower = better recovery
      // 60 bpm = 100, 100 bpm = 50, 100+ = low
      let hrScore;
      if (signals.restingHeartRate <= 60) {
        hrScore = 100;
      } else if (signals.restingHeartRate <= 100) {
        hrScore = Math.round(((100 - signals.restingHeartRate) / 40) * 100);
      } else {
        hrScore = Math.max(0, 100 - (signals.restingHeartRate - 100));
      }
      components.push({ weight: 0.1, value: Math.max(0, Math.min(100, hrScore)) });
    } else {
      components.push({ weight: 0.1, value: 50 }); // neutral if not provided
    }

    // Calculate weighted average
    const recoveryScore = Math.round(
      components.reduce((sum, comp) => sum + comp.value * comp.weight, 0)
    );

    return Math.max(0, Math.min(100, recoveryScore));
  },

  /**
   * Generate smart recommendations based on actual computed values
   * All recommendations are data-driven, not hardcoded
   */
  generateRecommendations(
    signals,
    metric,
    sleepQuality,
    hydrationLevel,
    trainingLoad,
    recoveryScore,
    goals
  ) {
    const recommendations = [];

    // Sleep recommendations
    if (sleepQuality < 70) {
      const actualSleep = metric?.sleepHours || 0;
      if (actualSleep < 6) {
        recommendations.push({
          priority: 'high',
          category: 'sleep',
          message: `You got ${actualSleep}h of sleep last night. Aim for 8 hours to improve recovery.`,
          action: 'Increase sleep target',
        });
      } else if (actualSleep < 7.5) {
        recommendations.push({
          priority: 'medium',
          category: 'sleep',
          message: `You got ${actualSleep}h of sleep. A bit more would help - try for 8 hours.`,
          action: 'Add 30-60 min more sleep',
        });
      }
    }

    // Hydration recommendations
    if (hydrationLevel < 70) {
      const targetWater = goals?.targets?.water || 2000;
      const actualWater = metric?.waterIntakeMl || 0;
      const deficit = targetWater - actualWater;

      if (deficit > 500) {
        recommendations.push({
          priority: 'high',
          category: 'hydration',
          message: `You're ${Math.round(deficit / 1000)}L short of your hydration goal. Drink more water today.`,
          action: `Drink ${Math.ceil(deficit / 250)} more glasses of water`,
        });
      } else {
        recommendations.push({
          priority: 'medium',
          category: 'hydration',
          message: `Hydration is ${hydrationLevel}% of goal. Keep drinking water throughout the day.`,
          action: 'Continue hydrating',
        });
      }
    }

    // Muscle soreness recommendations
    if (signals?.muscleSoreness >= 7) {
      recommendations.push({
        priority: 'high',
        category: 'recovery',
        message: `You're experiencing high muscle soreness (${signals.muscleSoreness}/10). Consider a rest day or light activity.`,
        action: 'Take an active recovery day (stretching, yoga, light walk)',
      });
    } else if (signals?.muscleSoreness >= 5) {
      recommendations.push({
        priority: 'medium',
        category: 'recovery',
        message: `Muscle soreness is moderate (${signals.muscleSoreness}/10). Recovery protocols may help.`,
        action: 'Try foam rolling or stretching',
      });
    }

    // Stress level recommendations
    if (signals?.stressLevel >= 8) {
      recommendations.push({
        priority: 'high',
        category: 'stress',
        message: `Your stress level is high (${signals.stressLevel}/10). This impacts recovery. Try stress management techniques.`,
        action: 'Practice meditation, deep breathing, or relaxation exercises',
      });
    } else if (signals?.stressLevel >= 6) {
      recommendations.push({
        priority: 'medium',
        category: 'stress',
        message: `Stress level is elevated (${signals.stressLevel}/10). Consider stress-reduction activities.`,
        action: 'Take a break, go for a walk, or practice mindfulness',
      });
    }

    // Resting heart rate recommendations
    if (signals?.restingHeartRate && signals.restingHeartRate > 85) {
      recommendations.push({
        priority: 'medium',
        category: 'training',
        message: `Your resting heart rate is elevated (${signals.restingHeartRate} bpm). This may indicate you need more recovery.`,
        action: 'Consider reducing workout intensity or taking a rest day',
      });
    }

    // Training load recommendations
    if (trainingLoad > 80) {
      recommendations.push({
        priority: 'medium',
        category: 'training',
        message: `Training load is very high (${trainingLoad}%). Ensure adequate recovery to prevent overtraining.`,
        action: 'Plan for recovery days and prioritize sleep/hydration',
      });
    }

    // Overall recovery score recommendations
    if (recoveryScore < 50) {
      recommendations.push({
        priority: 'high',
        category: 'overall',
        message: `Your recovery score is low (${recoveryScore}/100). Prioritize sleep, hydration, and stress management.`,
        action: 'Schedule a full recovery day with light activity only',
      });
    } else if (recoveryScore < 70) {
      recommendations.push({
        priority: 'medium',
        category: 'overall',
        message: `Recovery score could be better (${recoveryScore}/100). Focus on weak areas above.`,
        action: 'Address top 2-3 recommendations above',
      });
    } else if (recoveryScore >= 85) {
      recommendations.push({
        priority: 'low',
        category: 'overall',
        message: `Great recovery status (${recoveryScore}/100)! You're well-recovered. Ready for harder training if desired.`,
        action: 'You can push intensity if fitness goals require it',
      });
    }

    // Energy level insight if provided
    if (signals?.energyLevel) {
      if (signals.energyLevel < 4 && recoveryScore < 70) {
        recommendations.push({
          priority: 'high',
          category: 'energy',
          message: `Low energy (${signals.energyLevel}/10) and recovery is suboptimal. Focus on sleep and nutrition.`,
          action: 'Ensure 8+ hours sleep and adequate protein intake',
        });
      }
    }

    // If no recommendations generated, provide general guidance
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'low',
        category: 'overall',
        message: `Recovery status is good (${recoveryScore}/100). Maintain current habits to keep it up.`,
        action: 'Continue with current training and recovery plan',
      });
    }

    // Sort by priority (high first)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    return recommendations;
  },

  /**
   * Get recovery trend over a date range
   * @param {string} userId - User ID
   * @param {string} startDate - Start date 'YYYY-MM-DD'
   * @param {string} endDate - End date 'YYYY-MM-DD'
   * @returns {array} Recovery data for each date
   */
  async getRecoveryTrend(userId, startDate, endDate) {
    const recoveryDataArray = [];

    // Iterate through each day in the range
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
      const dateKey = current.toISOString().split('T')[0];
      const recoveryData = await this.getRecoveryData(userId, dateKey);
      recoveryDataArray.push(recoveryData);
      current.setDate(current.getDate() + 1);
    }

    return recoveryDataArray;
  },
};

module.exports = fitnessRecoveryService;
