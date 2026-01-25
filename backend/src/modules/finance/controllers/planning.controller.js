const { salaryProjection, investmentCorpus } = require("../services/planning.service");
const { createBudgetPreset, saveInvestmentPlan, saveSalaryProjection, getPlanningContext } = require("../services/budget.service");

// 1. Salary Projection
exports.generateProjection = async (req, res) => {
  try {
    const { startingSalary, incrementPct } = req.body;
    const result = salaryProjection(startingSalary, incrementPct);
    await saveSalaryProjection(req.user._id, result);
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 2. Save Budget Preset
exports.savePreset = async (req, res) => {
  try {
    const preset = await createBudgetPreset(req.user._id, req.body);
    res.json(preset);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// 3. Save Investment Plan
exports.savePlan = async (req, res) => {
  try {
    const plan = await saveInvestmentPlan(req.user._id, req.body);
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
  try {
    const ctx = await getPlanningContext(req.user._id);
    res.json(ctx || {});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
