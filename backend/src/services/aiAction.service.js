// src/services/aiAction.service.js
const FinancialContext = require('../models/FinancialContext');
const BudgetPreset = require('../models/BudgetPreset');
const InvestmentPlan = require('../models/InvestmentPlan');
const Goal = require('../models/Goal');
const AuditLog = require('../models/AuditLog');
const { randomUUID } = require("crypto");


/**
 * validateAction(action) -> { valid: boolean, reason?: string }
 * Very strict checks to avoid trash applying.
 */
function validateAction(action) {
  if (!action || !action.type || !action.id) return { valid: false, reason: 'missing fields' };
  const t = action.type;
  const p = action.payload || {};

  // Allowed types
  const allowed = ['adjust_budget','rebalance_investment','create_goal','flag_overspend','notify_user'];
  if (!allowed.includes(t)) return { valid: false, reason: 'invalid type' };

  if (t === 'adjust_budget') {
    const splits = p.splits;
    if (!splits) return { valid:false, reason:'no splits' };
    const total = (splits.needs||0)+(splits.wants||0)+(splits.investments||0)+(splits.emergency||0);
    if (Math.abs(total - 100) > 0.1) return { valid:false, reason:'splits must sum to 100' };
    // sanity ranges
    for (const k of ['needs','wants','investments','emergency']) {
      const v = splits[k];
      if (v < 0 || v > 100) return { valid:false, reason:`invalid ${k}` };
    }
  }

  if (t === 'rebalance_investment') {
    const alloc = p.allocations || {};
    const total = Object.values(alloc).reduce((s,x)=>s+(x||0),0);
    if (Math.abs(total - 100) > 0.1) return { valid:false, reason:'allocations must sum to 100' };
  }

  if (t === 'create_goal') {
    if (!p.title || !p.targetAmount) return { valid:false, reason:'goal needs title and targetAmount' };
    if (p.targetAmount <= 0) return { valid:false, reason:'targetAmount must be positive' };
  }

  return { valid: true };
}

/**
 * applyAction(action, userId)
 * Applies a validated action to DB. Returns { ok: true, record: ... } or throws.
 */
async function applyAction(action, userId) {
  // Generate ID if missing
  if (!action.id) {
    action.id = uuidv4();
  }
  const v = validateAction(action);
  if (!v.valid) throw new Error(`Invalid action: ${v.reason}`);

  // switch
  switch (action.type) {
    case 'adjust_budget': {
      // create a BudgetPreset named "AI - <timestamp>" and set activeBudgetPreset
      const preset = await BudgetPreset.create({
        userId,
        name: action.description || `AI preset ${Date.now()}`,
        splits: action.payload.splits,
        categories: action.payload.categories || {}
      });
      // update context
      await FinancialContext.updateOne({ userId }, { $set: { activeBudgetPreset: preset } });
      await AuditLog.create({ userId, actionId: action.id, type: action.type, payload: action.payload, notes: action.description });
      return { applied: true, preset };
    }

    case 'rebalance_investment': {
      // Update or create InvestmentPlan
      let plan = await InvestmentPlan.findOne({ userId });
      if (!plan) {
        plan = await InvestmentPlan.create({
          userId,
          allocations: action.payload.allocations,
          expectedReturns: action.payload.expectedReturns || {}
        });
      } else {
        plan.allocations = action.payload.allocations;
        if (action.payload.expectedReturns) plan.expectedReturns = action.payload.expectedReturns;
        await plan.save();
      }
      await FinancialContext.updateOne({ userId }, { $set: { activeInvestmentPlan: plan } });
      await AuditLog.create({ userId, actionId: action.id, type: action.type, payload: action.payload, notes: action.description });
      return { applied: true, plan };
    }

    case 'create_goal': {
      const g = await Goal.create({
        userId,
        title: action.payload.title,
        category: action.payload.category || 'General',
        targetAmount: action.payload.targetAmount,
        dueDate: action.payload.dueDate
      });
      await FinancialContext.updateOne({ userId }, { $push: { goals: g } });
      await AuditLog.create({ userId, actionId: action.id, type: action.type, payload: action.payload, notes: action.description });
      return { applied: true, goal: g };
    }

    case 'flag_overspend': {
      // simple write to context as a flagged note. No DB mutation of financials.
      const note = { type: 'overspend', payload: action.payload, when: new Date(), description: action.description };
      await FinancialContext.updateOne({ userId }, { $push: { autoInsights: note } });
      await AuditLog.create({ userId, actionId: action.id, type: action.type, payload: action.payload, notes: action.description });
      return { applied: true, note };
    }

    case 'notify_user': {
      // store a notification in autoInsights or a notification collection (not implemented)
      await FinancialContext.updateOne({ userId }, { $push: { autoInsights: { note: action.payload.message } } });
      await AuditLog.create({ userId, actionId: action.id, type: action.type, payload: action.payload, notes: action.description });
      return { applied: true };
    }

    default:
      throw new Error('unknown action');
  }
}

module.exports = { validateAction, applyAction };
