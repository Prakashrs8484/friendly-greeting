const FitnessGoals = require('../models/FitnessGoals');
const FitnessDailyMetric = require('../models/FitnessDailyMetric');

const fitnessGoalsService = {
  /**
   * Get user's fitness goals
   * @param {string} userId - User ID
   * @returns {object} Goals document with goalMode and targets
   */
  async getGoals(userId) {
    let goals = await FitnessGoals.findOne({ userId });

    if (!goals) {
      // Create default goals if they don't exist
      goals = new FitnessGoals({ userId });
      await goals.save();
    }

    return goals;
  },

  /**
   * Update user's fitness goals
   * @param {string} userId - User ID
   * @param {object} updates - Fields to update: goalMode, targets, description
   * @returns {object} Updated goals
   */
  async updateGoals(userId, updates) {
    const allowedFields = ['goalMode', 'targets', 'description'];
    const filteredUpdates = {};

    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    }

    const goals = await FitnessGoals.findOneAndUpdate(
      { userId },
      filteredUpdates,
      { new: true, upsert: true, runValidators: true }
    );

    return goals;
  },

  /**
   * Get progress toward goals for a specific date
   * Calculates percentage completion and remaining values
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {object} Progress data with metrics vs targets
   */
  async getGoalsProgress(userId, dateKey) {
    // Fetch goals
    const goals = await this.getGoals(userId);

    // Fetch daily metrics for the date
    const metric = await FitnessDailyMetric.findOne({
      userId,
      dateKey,
    });

    // Use metric values or 0 if no metric exists for that date
    const current = {
      calories: metric?.caloriesConsumed || 0,
      protein: metric?.proteinIntake || 0,
      water: metric?.waterIntakeMl || 0,
      workoutMinutes: metric?.workoutMinutes || 0,
      sleepHours: metric?.sleepHours || 0,
    };

    const targets = goals.targets;

    // Calculate progress for each metric
    const progress = {
      dateKey,
      goalMode: goals.goalMode,
      metrics: {
        calories: {
          current: current.calories,
          target: targets.calories,
          remaining: Math.max(0, targets.calories - current.calories),
          percentage: this.calculatePercentage(current.calories, targets.calories),
          unit: 'kcal',
          exceeded: current.calories > targets.calories,
        },
        protein: {
          current: current.protein,
          target: targets.protein,
          remaining: Math.max(0, targets.protein - current.protein),
          percentage: this.calculatePercentage(current.protein, targets.protein),
          unit: 'g',
          exceeded: current.protein > targets.protein,
        },
        water: {
          current: current.water,
          target: targets.water,
          remaining: Math.max(0, targets.water - current.water),
          percentage: this.calculatePercentage(current.water, targets.water),
          unit: 'ml',
          exceeded: current.water > targets.water,
        },
        workoutMinutes: {
          current: current.workoutMinutes,
          target: targets.workoutMinutes,
          remaining: Math.max(0, targets.workoutMinutes - current.workoutMinutes),
          percentage: this.calculatePercentage(
            current.workoutMinutes,
            targets.workoutMinutes
          ),
          unit: 'min',
          exceeded: current.workoutMinutes > targets.workoutMinutes,
        },
        sleepHours: {
          current: Math.round(current.sleepHours * 10) / 10, // Round to 1 decimal
          target: targets.sleepHours,
          remaining: Math.max(0, targets.sleepHours - current.sleepHours),
          percentage: this.calculatePercentage(current.sleepHours, targets.sleepHours),
          unit: 'h',
          exceeded: current.sleepHours > targets.sleepHours,
        },
      },
      summary: {
        allGoalsMet: this.checkAllGoalsMet(current, targets),
        goalsMetCount: this.countGoalsMet(current, targets),
        totalGoalsCount: 5,
      },
    };

    return progress;
  },

  /**
   * Calculate percentage (capped at 100% for exceeded metrics)
   * @param {number} current - Current value
   * @param {number} target - Target value
   * @returns {number} Percentage (0-100+, but typically 0-100)
   */
  calculatePercentage(current, target) {
    if (target === 0) return 0;
    return Math.round((current / target) * 100);
  },

  /**
   * Check if all goals are met for a day
   */
  checkAllGoalsMet(current, targets) {
    return (
      current.calories <= targets.calories &&
      current.protein >= targets.protein &&
      current.water >= targets.water &&
      current.workoutMinutes >= targets.workoutMinutes &&
      current.sleepHours >= targets.sleepHours
    );
  },

  /**
   * Count how many goals are met
   */
  countGoalsMet(current, targets) {
    let count = 0;
    if (current.calories <= targets.calories) count++;
    if (current.protein >= targets.protein) count++;
    if (current.water >= targets.water) count++;
    if (current.workoutMinutes >= targets.workoutMinutes) count++;
    if (current.sleepHours >= targets.sleepHours) count++;
    return count;
  },

  /**
   * Get default goal targets based on goal mode
   * @param {string} goalMode - 'fat_loss', 'muscle_gain', or 'maintenance'
   * @returns {object} Default targets for the goal mode
   */
  getDefaultTargetsForMode(goalMode) {
    const defaults = {
      maintenance: {
        calories: 2000,
        protein: 150,
        water: 2000,
        workoutMinutes: 30,
        sleepHours: 8,
      },
      fat_loss: {
        calories: 1600, // ~20% deficit from 2000
        protein: 180, // higher protein for muscle preservation
        water: 2500, // higher hydration
        workoutMinutes: 45,
        sleepHours: 8,
      },
      muscle_gain: {
        calories: 2400, // ~20% surplus from 2000
        protein: 200, // high protein for muscle synthesis
        water: 2000,
        workoutMinutes: 60, // more intensive training
        sleepHours: 8,
      },
    };

    return defaults[goalMode] || defaults.maintenance;
  },
};

module.exports = fitnessGoalsService;
