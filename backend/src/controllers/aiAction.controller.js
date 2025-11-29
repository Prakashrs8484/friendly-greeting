const FinancialContext = require('../models/FinancialContext');
const { validateAction, applyAction } = require('../services/aiAction.service');

exports.previewActions = async (req, res) => {
  const ctx = await FinancialContext.findOne({ userId: req.user._id }) || {};
  return res.json({ pendingActions: ctx.pendingActions || [] });
};

exports.applyAction = async (req, res) => {
  try {
    const { actionId } = req.body;
    const ctx = await FinancialContext.findOne({ userId: req.user._id }) || {};
    const action = (ctx.pendingActions || []).find(a => a.id === actionId);
    if (!action) return res.status(404).json({ message: 'Action not found' });

    // validate
    const val = validateAction(action);
    if (!val.valid) return res.status(400).json({ message: 'Invalid action: ' + val.reason });

    // apply
    const result = await applyAction(action, req.user._id);

    // remove from pendingActions
    await FinancialContext.updateOne({ userId: req.user._id }, { $pull: { pendingActions: { id: actionId } } });

    return res.json({ applied: true, result });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.applyAll = async (req,res) => {
  try {
    const ctx = await FinancialContext.findOne({ userId: req.user._id }) || {};
    if (!ctx.pendingActions || ctx.pendingActions.length === 0) return res.json({ applied: 0 });

    // if autoApply not enabled, refuse unless `force=true` and user has permission
    if (!ctx.autoApply && !req.body.force) return res.status(403).json({ message: 'AutoApply disabled. Use apply-action per item or enable autoApply.' });

    const applied = [];
    for (const action of ctx.pendingActions) {
      try {
        const val = validateAction(action);
        if (!val.valid) continue; // skip invalid
        const r = await applyAction(action, req.user._id);
        applied.push({ id: action.id, result: r });
      } catch (e) {
        // continue
      }
    }
    // clear pendingActions
    await FinancialContext.updateOne({ userId: req.user._id }, { $set: { pendingActions: [] } });
    return res.json({ applied: applied.length, details: applied });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};
