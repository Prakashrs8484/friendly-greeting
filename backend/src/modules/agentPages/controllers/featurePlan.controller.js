const FeaturePlan = require('../models/featurePlan.model');
const { generateFeatureSchema } = require('../services/featureArchitectAgent.service');

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
        layout: p.layout || { type: 'vertical' },
        sections: Array.isArray(p.ui) ? p.ui : [],
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
 * Generate and save a feature plan from natural language prompt
 */
exports.generateFeaturePlan = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const pageId = req.params.pageId;
    const prompt = req.body?.prompt || req.body?.input || req.body?.description;

    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      return res.status(404).json({
        success: false,
        message: 'Agent page not found'
      });
    }

    if (!prompt || !String(prompt).trim()) {
      return res.status(400).json({
        success: false,
        message: 'prompt is required'
      });
    }

    const schema = await generateFeatureSchema(String(prompt).trim());

    const plan = new FeaturePlan({
      pageId,
      featureName: schema.featureName || 'Custom Feature',
      type: schema.type || 'custom',
      description: schema.description || '',
      layout: schema.layout || { type: 'vertical' },
      ui: Array.isArray(schema.sections) ? schema.sections : [],
      dataModel: Array.isArray(schema.dataModel) ? schema.dataModel : [],
      aiCapabilities: Array.isArray(schema.aiCapabilities) ? schema.aiCapabilities : []
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
        layout: plan.layout || { type: 'vertical' },
        sections: Array.isArray(plan.ui) ? plan.ui : [],
        ui: plan.ui,
        dataModel: plan.dataModel,
        aiCapabilities: plan.aiCapabilities,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      }
    });
  } catch (err) {
    console.error('[FeaturePlan Controller] Error generating plan:', {
      error: err.message,
      stack: err.stack,
      pageId: req.params.pageId
    });
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to generate feature plan'
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
      layout,
      sections,
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
      layout: (layout && typeof layout === 'object') ? layout : { type: 'vertical' },
      ui: Array.isArray(sections) ? sections : (Array.isArray(ui) ? ui : []),
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
        layout: plan.layout || { type: 'vertical' },
        sections: Array.isArray(plan.ui) ? plan.ui : [],
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
