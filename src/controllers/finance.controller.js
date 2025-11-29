const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Goal = require('../models/Goal');

exports.addExpense = async (req, res) => {
  try {
    const { description, category, amount, paymentMethod, date } = req.body;
    const e = new Expense({ userId: req.user._id, description, category, amount, paymentMethod, date });
    await e.save();
    return res.json(e);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.listExpenses = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const q = { userId: req.user._id };
    if(startDate || endDate) q.date = {};
    if(startDate) q.date.$gte = new Date(startDate);
    if(endDate) q.date.$lte = new Date(endDate);
    const items = await Expense.find(q).sort({ date: -1 }).limit(200);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.addIncome = async (req, res) => {
  try {
    const { source, amount, date } = req.body;
    const i = new Income({ userId: req.user._id, source, amount, date });
    await i.save();
    return res.json(i);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.listIncome = async (req, res) => {
  try {
    const items = await Income.find({ userId: req.user._id }).sort({ date: -1 }).limit(200);
    return res.json(items);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.addGoal = async (req, res) => {
  try {
    const { title, category, targetAmount, dueDate } = req.body;
    const g = new Goal({ userId: req.user._id, title, category, targetAmount, dueDate });
    await g.save();
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

exports.getStats = async (req, res) => {
  try {
    const { month, year } = req.query;
    const start = month ? new Date(year || new Date().getFullYear(), month - 1, 1) : new Date(new Date().getFullYear(), 0, 1);
    const end = month ? new Date(year || new Date().getFullYear(), month, 0, 23, 59, 59) : new Date();

    const expenses = await Expense.find({ userId: req.user._id, date: { $gte: start, $lte: end } });
    const incomes = await Income.find({ userId: req.user._id, date: { $gte: start, $lte: end } });

    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const netSavings = totalIncome - totalExpenses;
    const activeGoals = await Goal.countDocuments({ userId: req.user._id });

    return res.json({ monthlyIncome: totalIncome, totalExpenses, netSavings, activeGoals });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
