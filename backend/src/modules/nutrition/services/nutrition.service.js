const NutritionContext = require('../models/NutritionContext');

/**
 * Nutrition Service - Business logic for nutrition tracking and analysis
 */

/**
 * Get nutrition context for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Nutrition context
 */
exports.getNutritionContext = async (userId) => {
  return await NutritionContext.findOne({ userId });
};

/**
 * Update nutrition context
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} - Updated nutrition context
 */
exports.updateNutritionContext = async (userId, updates) => {
  const context = await NutritionContext.findOneAndUpdate(
    { userId },
    { 
      $set: { ...updates, lastUpdated: new Date() }
    },
    { upsert: true, new: true }
  );
  
  return context;
};

/**
 * Calculate daily nutrition summary
 * @param {string} userId - User ID
 * @param {Date} date - Date to calculate for (defaults to today)
 * @returns {Promise<Object>} - Daily nutrition summary
 */
exports.calculateDailySummary = async (userId, date = new Date()) => {
  const context = await NutritionContext.findOne({ userId });
  if (!context || !context.logs) {
    return { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 };
  }

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const dayLogs = context.logs.filter(log => {
    const logDate = new Date(log.timestamp || log.date);
    return logDate >= startOfDay && logDate <= endOfDay;
  });

  const summary = dayLogs.reduce((acc, log) => {
    acc.totalCalories += log.calories || 0;
    acc.totalProtein += log.protein || 0;
    acc.totalCarbs += log.carbs || 0;
    acc.totalFats += log.fats || 0;
    return acc;
  }, { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 });

  return summary;
};

/**
 * Add nutrition log entry
 * @param {string} userId - User ID
 * @param {Object} logEntry - Log entry data
 * @returns {Promise<Object>} - Result with success and log entry
 */
exports.addNutritionLog = async (userId, logEntry) => {
  const context = await NutritionContext.findOne({ userId });
  
  if (!context) {
    const newContext = await NutritionContext.create({ 
      userId, 
      logs: [{ ...logEntry, timestamp: new Date() }] 
    });
    return { success: true, log: newContext.logs[0] };
  }
  
  const log = { ...logEntry, timestamp: new Date() };
  context.logs.push(log);
  context.lastUpdated = new Date();
  await context.save();
  
  return { success: true, log: context.logs[context.logs.length - 1] };
};

/**
 * Update daily targets
 * @param {string} userId - User ID
 * @param {Object} targets - Daily target values
 * @returns {Promise<Object>} - Result with success and updated targets
 */
exports.updateDailyTargets = async (userId, targets) => {
  const context = await NutritionContext.findOne({ userId });
  
  if (!context) {
    const newContext = await NutritionContext.create({ 
      userId, 
      dailyTargets: targets,
      lastUpdated: new Date()
    });
    return { success: true, dailyTargets: newContext.dailyTargets };
  }
  
  context.dailyTargets = { ...context.dailyTargets, ...targets };
  context.lastUpdated = new Date();
  await context.save();
  
  return { success: true, dailyTargets: context.dailyTargets };
};

/**
 * Get nutrition insights (placeholder for future AI integration)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Nutrition insights
 */
exports.getInsights = async (userId) => {
  const context = await exports.getNutritionContext(userId);
  return context?.insights || {};
};

