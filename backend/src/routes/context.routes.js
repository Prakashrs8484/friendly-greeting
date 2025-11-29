const r = require('express').Router();
const auth = require('../middleware/auth');
const FinancialContext = require('../models/FinancialContext');
const CareerContext = require('../models/CareerContext');
const HealthContext = require('../models/HealthContext');
const NutritionContext = require('../models/NutritionContext');
const LifestyleContext = require('../models/LifestyleContext');
const NotesContext = require('../models/NotesContext');

r.get('/finance', auth, async (req, res) => {
  const ctx = await FinancialContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
r.get('/career', auth, async (req, res) => {
  const ctx = await CareerContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
r.get('/health', auth, async (req, res) => {
  const ctx = await HealthContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
r.get('/nutrition', auth, async (req, res) => {
  const ctx = await NutritionContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
r.get('/lifestyle', auth, async (req, res) => {
  const ctx = await LifestyleContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
r.get('/notes', auth, async (req, res) => {
  const ctx = await NotesContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});

module.exports = r;
