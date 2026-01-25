const LifestyleContext = require('../models/LifestyleContext');

/**
 * Lifestyle Service - Business logic for lifestyle tracking
 */

/**
 * Get lifestyle context for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Lifestyle context
 */
exports.getLifestyleContext = async (userId) => {
  return await LifestyleContext.findOne({ userId });
};

/**
 * Update lifestyle context
 * @param {string} userId - User ID
 * @param {Object} updates - Updates to apply
 * @returns {Promise<Object>} - Updated lifestyle context
 */
exports.updateLifestyleContext = async (userId, updates) => {
  const context = await LifestyleContext.findOneAndUpdate(
    { userId },
    { 
      $set: { ...updates, lastUpdated: new Date() }
    },
    { upsert: true, new: true }
  );
  
  return context;
};
