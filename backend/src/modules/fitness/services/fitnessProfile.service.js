const FitnessProfile = require('../models/FitnessProfile');

const fitnessProfileService = {
  /**
   * Get or create a user's fitness profile
   * @param {string} userId - User ID
   * @returns {object} Fitness profile
   */
  async getProfile(userId) {
    let profile = await FitnessProfile.findOne({ userId });

    if (!profile) {
      profile = new FitnessProfile({ userId });
      await profile.save();
    }

    return profile;
  },

  /**
   * Update user's fitness profile goals and targets
   * @param {string} userId - User ID
   * @param {object} updates - Fields to update
   * @returns {object} Updated fitness profile
   */
  async updateProfile(userId, updates) {
    const allowedFields = [
      'dailyCalorieGoal',
      'dailyProteinGoal',
      'dailyWaterGoal',
      'weeklyWorkoutMinutesGoal',
      'dailySleepGoal',
      'recoveryTargetScore',
    ];

    // Filter to only allowed fields
    const filteredUpdates = {};
    for (const field of allowedFields) {
      if (field in updates) {
        filteredUpdates[field] = updates[field];
      }
    }

    const profile = await FitnessProfile.findOneAndUpdate(
      { userId },
      filteredUpdates,
      { new: true, upsert: true, runValidators: true }
    );

    return profile;
  },

  /**
   * Get default fitness profile values
   * @returns {object} Default profile fields
   */
  getDefaultProfile() {
    return {
      dailyCalorieGoal: 2000,
      dailyProteinGoal: 150,
      dailyWaterGoal: 2000,
      weeklyWorkoutMinutesGoal: 300,
      dailySleepGoal: 8,
      recoveryTargetScore: 80,
    };
  },
};

module.exports = fitnessProfileService;
