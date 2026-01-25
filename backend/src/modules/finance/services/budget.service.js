const BudgetPreset = require('../models/BudgetPreset');
const InvestmentPlan = require('../models/InvestmentPlan');
const FinancialContext = require('../models/FinancialContext');

/**
 * Budget Service - Business logic for budget presets and investment plans
 */

/**
 * Create a budget preset and set it as active
 * @param {string} userId - User ID
 * @param {Object} presetData - Budget preset data
 * @returns {Promise<Object>} - Created budget preset
 */
exports.createBudgetPreset = async (userId, presetData) => {
  const preset = await BudgetPreset.create({
    userId,
    ...presetData
  });

  await FinancialContext.updateOne(
    { userId },
    { $set: { activeBudgetPreset: preset } },
    { upsert: true }
  );

  return preset;
};

/**
 * Create or update an investment plan
 * @param {string} userId - User ID
 * @param {Object} planData - Investment plan data
 * @returns {Promise<Object>} - Created or updated investment plan
 */
exports.saveInvestmentPlan = async (userId, planData) => {
  let plan = await InvestmentPlan.findOne({ userId });

  if (!plan) {
    plan = await InvestmentPlan.create({ userId, ...planData });
  } else {
    Object.assign(plan, planData);
    await plan.save();
  }

  await FinancialContext.updateOne(
    { userId },
    { $set: { activeInvestmentPlan: plan } },
    { upsert: true }
  );

  return plan;
};

/**
 * Save salary projection to financial context
 * @param {string} userId - User ID
 * @param {Object} projection - Salary projection data
 * @returns {Promise<void>}
 */
exports.saveSalaryProjection = async (userId, projection) => {
  await FinancialContext.updateOne(
    { userId },
    { $set: { salaryProjection: projection } },
    { upsert: true }
  );
};

/**
 * Get planning context (financial context)
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Financial context
 */
exports.getPlanningContext = async (userId) => {
  return await FinancialContext.findOne({ userId });
};

