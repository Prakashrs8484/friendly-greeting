const BudgetPreset = require("../models/BudgetPreset");
const InvestmentPlan = require("../models/InvestmentPlan");
const FinancialContext = require("../models/FinancialContext");
const { salaryProjection, investmentCorpus } = require("../services/planning.service");

// 1. Salary Projection
exports.generateProjection = async (req, res) => {
  try {
    const { startingSalary, incrementPct } = req.body;
    const result = salaryProjection(startingSalary, incrementPct);

    await FinancialContext.updateOne(
      { userId: req.user._id },
      { $set: { salaryProjection: result } },
      { upsert: true }
    );

    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 2. Save Budget Preset
exports.savePreset = async (req, res) => {
  try {
    const preset = await BudgetPreset.create({
      userId: req.user._id,
      ...req.body
    });

    await FinancialContext.updateOne(
      { userId: req.user._id },
      { $set: { activeBudgetPreset: preset } },
      { upsert: true }
    );

    res.json(preset);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 3. Save Investment Plan
exports.savePlan = async (req, res) => {
  try {
    let plan = await InvestmentPlan.findOne({ userId: req.user._id });

    if (!plan) plan = await InvestmentPlan.create({ userId: req.user._id, ...req.body });
    else {
      Object.assign(plan, req.body);
      await plan.save();
    }

    await FinancialContext.updateOne(
      { userId: req.user._id },
      { $set: { activeInvestmentPlan: plan } },
      { upsert: true }
    );

    res.json(plan);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 4. Investment Corpus Calculation
exports.calculateCorpus = async (req, res) => {
  try {
    const result = investmentCorpus(
      req.body.monthlyContribution,
      req.body.allocations,
      req.body.returns
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 5. Combined Planning Context
exports.getPlanningContext = async (req, res) => {
  const ctx = await FinancialContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
};
