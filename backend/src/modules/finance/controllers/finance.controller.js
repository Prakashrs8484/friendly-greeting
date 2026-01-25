const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Goal = require('../models/Goal');
const { updateFinancialContext } = require('../services/financialContext.service');
const { calculateMonthlyStats, getFinancialContext } = require('../services/transaction.service');

exports.addExpense = async (req, res) => {
  try {
    const e = await Expense.create({ ...req.body, userId: req.user._id });
    await updateFinancialContext(req.user._id);
    return res.json(e);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.listExpenses = async (req, res) => {
  try {
    const items = await Expense.find({ userId: req.user._id }).sort({ date: -1 }).limit(500);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.addIncome = async (req, res) => {
  try {
    const i = await Income.create({ ...req.body, userId: req.user._id });
    await updateFinancialContext(req.user._id);
    return res.json(i);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.listIncome = async (req, res) => {
  try {
    const items = await Income.find({ userId: req.user._id }).sort({ date: -1 }).limit(500);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.addGoal = async (req, res) => {
  try {
    const g = await Goal.create({ ...req.body, userId: req.user._id });
    await updateFinancialContext(req.user._id);
    return res.json(g);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.listGoals = async (req, res) => {
  try {
    const items = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getContext = async (req, res) => {
  try {
    const ctx = await getFinancialContext(req.user._id);
    return res.json(ctx || {});
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const stats = await calculateMonthlyStats(req.user._id, parseInt(month), parseInt(year));
    return res.json(stats);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

