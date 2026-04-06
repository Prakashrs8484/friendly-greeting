const FitnessEntry = require('../models/FitnessEntry');

const fitnessEntryService = {
  /**
   * Add a new fitness entry
   * @param {string} userId - User ID
   * @param {string} entryType - Type of entry (meal, workout, sleep, hydration, activity, recovery)
   * @param {object} data - Entry data specific to the entry type
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {object} Created entry
   */
  async addEntry(userId, entryType, data, dateKey) {
    const entry = new FitnessEntry({
      userId,
      entryType,
      dateKey,
      ...data,
    });
    return await entry.save();
  },

  /**
   * Get all entries for a specific day
   * @param {string} userId - User ID
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {array} Array of entries
   */
  async getEntriesForDay(userId, dateKey) {
    return await FitnessEntry.find({
      userId,
      dateKey,
    }).sort({ timestamp: 1 });
  },

  /**
   * Get entries within a date range
   * @param {string} userId - User ID
   * @param {string} startDate - Start date in 'YYYY-MM-DD' format
   * @param {string} endDate - End date in 'YYYY-MM-DD' format
   * @returns {array} Array of entries
   */
  async getEntriesByDateRange(userId, startDate, endDate) {
    return await FitnessEntry.find({
      userId,
      dateKey: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ timestamp: 1 });
  },

  /**
   * Get recent entries
   * @param {string} userId - User ID
   * @param {number} days - Number of days to retrieve
   * @returns {array} Array of entries
   */
  async getRecentEntries(userId, days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return await FitnessEntry.find({
      userId,
      createdAt: { $gte: startDate },
    }).sort({ timestamp: -1 });
  },
};

module.exports = fitnessEntryService;
