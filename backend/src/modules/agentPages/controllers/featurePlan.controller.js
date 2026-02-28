const FeaturePlan = require('../models/featurePlan.model');

/**
 * Get all feature plans for a page
 */
exports.getPageFeaturePlans = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const pageId = req.params.pageId;

    // Verify page belongs to user
    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Agent page not found'
      });
    }

    const plans = await FeaturePlan.find({ pageId }).sort({ createdAt: -1 }).lean();
    return res.json({
      success: true,
      featurePlans: plans.map(p => ({
        _id: p._id.toString(),
        pageId: p.pageId.toString(),
        featureName: p.featureName,
        type: p.type,
        description: p.description,
        ui: p.ui,
        dataModel: p.dataModel,
        aiCapabilities: p.aiCapabilities,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }))
    });
  } catch (err) {
    console.error('[FeaturePlan Controller] Error getting plans:', {
      error: err.message,
      stack: err.stack,
      pageId: req.params.pageId
    });
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to get feature plans'
    });
  }
};

/**
 * Create a feature plan for a page
 */
exports.createFeaturePlan = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const pageId = req.params.pageId;
    const {
      featureName,
      type,
      description,
      ui,
      dataModel,
      aiCapabilities
    } = req.body || {};

    // Verify page belongs to user
    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Agent page not found'
      });
    }

    if (!featureName || !type) {
      return res.status(400).json({
        success: false,
        message: 'featureName and type are required'
      });
    }

    const plan = new FeaturePlan({
      pageId,
      featureName,
      type,
      description: description || '',
      ui: Array.isArray(ui) ? ui : [],
      dataModel: Array.isArray(dataModel) ? dataModel : [],
      aiCapabilities: Array.isArray(aiCapabilities) ? aiCapabilities : []
    });

    await plan.save();

    return res.status(201).json({
      success: true,
      featurePlan: {
        _id: plan._id.toString(),
        pageId: plan.pageId.toString(),
        featureName: plan.featureName,
        type: plan.type,
        description: plan.description,
        ui: plan.ui,
        dataModel: plan.dataModel,
        aiCapabilities: plan.aiCapabilities,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      }
    });
  } catch (err) {
    console.error('[FeaturePlan Controller] Error creating plan:', {
      error: err.message,
      stack: err.stack,
      pageId: req.params.pageId
    });
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create feature plan'
    });
  }
};
