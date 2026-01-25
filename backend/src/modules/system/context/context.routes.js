const r = require('express').Router();
const auth = require('../../../middleware/auth');
const FinancialContext = require('../../finance/models/FinancialContext');
const CareerContext = require('../models/CareerContext');
const HealthContext = require('../../health/models/HealthContext');
const NutritionContext = require('../../nutrition/models/NutritionContext');
const LifestyleContext = require('../../lifestyle/models/LifestyleContext');
const NotesContext = require('../../notes/models/NotesContext');

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
