const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Goal = require('../models/Goal');

/**
 * Transaction Service - Business logic for expenses, income, and goals
 */

/**
 * Calculate monthly financial statistics
 * @param {string} userId - User ID
 * @param {number} month - Month (1-12)
 * @param {number} year - Year
 * @returns {Promise<Object>} - Stats object with monthlyIncome, totalExpenses, netSavings, activeGoals
 */
exports.calculateMonthlyStats = async (userId, month, year) => {
  // Convert month/year to date range
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const incomes = await Income.aggregate([
    { $match: { userId, date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const expenses = await Expense.aggregate([
    { $match: { userId, date: { $gte: start, $lt: end } } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);

  const goals = await Goal.find({ userId, achieved: false });

  const monthlyIncome = incomes[0]?.total || 0;
  const totalExpenses = expenses[0]?.total || 0;
  const netSavings = monthlyIncome - totalExpenses;

  return {
    monthlyIncome,
    totalExpenses,
    netSavings,
    activeGoals: goals.length
  };
};

/**
 * Get financial context for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Financial context object
 */
exports.getFinancialContext = async (userId) => {
  const FinancialContext = require('../models/FinancialContext');
  return await FinancialContext.findOne({ userId });
};

