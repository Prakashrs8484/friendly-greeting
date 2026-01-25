const HealthContext = require('../models/HealthContext');

/**
 * Health Service - Business logic for health and fitness tracking
 */

/**
 * Get health context for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Health context
 */
exports.getHealthContext = async (userId) => {
  return await HealthContext.findOne({ userId });
};

/**
 * Update health context
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} - Updated health context
 */
exports.updateHealthContext = async (userId, updates) => {
  const context = await HealthContext.findOneAndUpdate(
    { userId },
    { 
      $set: { ...updates, lastUpdated: new Date() }
    },
    { upsert: true, new: true }
  );
  
  return context;
};

/**
 * Update health metrics
 * @param {string} userId - User ID
 * @param {Object} metrics - Metric values (weight, sleep, heartRate, etc.)
 * @returns {Promise<Object>} - Result with success and updated metrics
 */
exports.updateMetrics = async (userId, metrics) => {
  const context = await HealthContext.findOne({ userId });
  
  if (!context) {
    const newContext = await HealthContext.create({ 
      userId, 
      metrics: { ...metrics, lastUpdated: new Date() },
      lastUpdated: new Date()
    });
    return { success: true, metrics: newContext.metrics };
  }
  
  context.metrics = { ...context.metrics, ...metrics, lastUpdated: new Date() };
  context.lastUpdated = new Date();
  await context.save();
  
  return { success: true, metrics: context.metrics };
};

/**
 * Add workout log entry
 * @param {string} userId - User ID
 * @param {Object} workout - Workout data
 * @returns {Promise<Object>} - Result with success and workout entry
 */
exports.addWorkout = async (userId, workout) => {
  const context = await HealthContext.findOne({ userId });
  
  if (!context) {
    const newContext = await HealthContext.create({ 
      userId, 
      workouts: [{ ...workout, timestamp: new Date() }] 
    });
    return { success: true, workout: newContext.workouts[0] };
  }
  
  const workoutEntry = { ...workout, timestamp: new Date() };
  context.workouts.push(workoutEntry);
  context.lastUpdated = new Date();
  await context.save();
  
  return { success: true, workout: context.workouts[context.workouts.length - 1] };
};

/**
 * Get recovery data
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Recovery data
 */
exports.getRecovery = async (userId) => {
  const context = await HealthContext.findOne({ userId });
  return context?.recovery || {};
};

/**
 * Calculate health summary (placeholder for future analytics)
 * @param {string} userId - User ID
 * @param {Date} startDate - Start date for summary
 * @param {Date} endDate - End date for summary
 * @returns {Promise<Object>} - Health summary
 */
exports.calculateHealthSummary = async (userId, startDate, endDate) => {
  const context = await HealthContext.findOne({ userId });
  if (!context) {
    return { totalWorkouts: 0, avgSleep: 0, avgHeartRate: 0 };
  }

  const filteredWorkouts = context.workouts?.filter(workout => {
    const workoutDate = new Date(workout.timestamp || workout.date);
    return workoutDate >= startDate && workoutDate <= endDate;
  }) || [];

  // Placeholder calculations - can be expanded
  return {
    totalWorkouts: filteredWorkouts.length,
    avgSleep: context.metrics?.sleep || 0,
    avgHeartRate: context.metrics?.heartRate || 0
  };
};

/**
 * Get health insights (placeholder for future AI integration)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Health insights
 */
exports.getInsights = async (userId) => {
  const context = await exports.getHealthContext(userId);
  return context?.insights || {};
};

