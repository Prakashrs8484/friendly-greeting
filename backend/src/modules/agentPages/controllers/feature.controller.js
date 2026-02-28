const {
  generateFeature,
  getPageFeatures,
  deleteFeature
} = require('../services/featureGeneration.service');

const {
  handleFeatureEvent
} = require('../services/pageOrchestrator.service');

/**
 * Create a feature from natural language input
 */
exports.createFeature = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const pageId = req.params.pageId;
    const userInput = req.body.input || req.body.description;

    console.log('[Feature Controller] Creating feature:', { pageId, userInput: userInput?.substring(0, 100) });

    if (!userInput || !userInput.trim()) {
      console.error('[Feature Controller] Missing feature description');
      return res.status(400).json({ 
        success: false,
        message: 'Feature description is required' 
      });
    }

    // Verify page belongs to user
    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      console.error('[Feature Controller] Page not found:', { pageId, userId: req.user._id });
      return res.status(404).json({ 
        success: false,
        message: 'Agent page not found' 
      });
    }

    // Generate feature and agents
    console.log('[Feature Controller] [DB WRITE] Generating feature...');
    const feature = await generateFeature(pageId, req.user._id, userInput.trim());
    console.log('[Feature Controller] [DB WRITE] Feature created successfully:', feature._id, 'Type:', feature.type, 'Agents:', feature.agentIds?.length || 0);

    // Trigger feature event via orchestrator
    console.log('[Feature Controller] [FEATURE EVENT] Triggering feature created event...');
    await handleFeatureEvent(pageId, feature._id, 'created', { type: feature.type, agentIds: feature.agentIds });
    console.log('[Feature Controller] [FEATURE EVENT] Feature event handled successfully');

    // Return feature in format expected by frontend
    return res.status(201).json({
      success: true,
      featureId: feature._id,
      message: 'Feature created successfully',
      feature: {
        _id: feature._id,
        pageId: feature.pageId,
        name: feature.name,
        description: feature.description,
        type: feature.type,
        uiConfig: feature.uiConfig,
        config: feature.config,
        featurePlan: feature.config?.featurePlan || null,
        agentIds: feature.agentIds,
        originalInput: feature.originalInput,
        createdAt: feature.createdAt,
        updatedAt: feature.updatedAt
      }
    });
  } catch (err) {
    console.error('[Feature Controller] Error creating feature:', {
      error: err.message,
      stack: err.stack,
      pageId: req.params.pageId,
      userId: req.user?._id
    });
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to create feature',
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
};

/**
 * Get all features for a page
 */
exports.getPageFeatures = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const pageId = req.params.pageId;

    // Verify page belongs to user
    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      console.error('[Feature Controller] Page not found:', { pageId, userId: req.user._id });
      return res.status(404).json({ 
        success: false,
        message: 'Agent page not found' 
      });
    }

    const features = await getPageFeatures(pageId);
    console.log('[Feature Controller] Found', features.length, 'features');
    
    return res.json({
      success: true,
      features: features.map(f => ({
        _id: f._id,
        pageId: f.pageId,
        name: f.name,
        description: f.description,
        type: f.type,
        uiConfig: f.uiConfig,
        config: f.config,
        featurePlan: f.config?.featurePlan || null,
        agentIds: f.agentIds || [],
        originalInput: f.originalInput,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt
      }))
    });
  } catch (err) {
    console.error('[Feature Controller] Error getting page features:', {
      error: err.message,
      stack: err.stack,
      pageId: req.params.pageId
    });
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to get features'
    });
  }
};

/**
 * Delete a feature
 */
exports.deleteFeature = async (req, res) => {
  try {
    const Feature = require('../models/feature.model');
    const AgentPage = require('../models/agentPage.model');
    const featureId = req.params.featureId;

    // Verify feature belongs to user's page
    const feature = await Feature.findById(featureId);
    if (!feature) {
      console.error('[Feature Controller] Feature not found:', featureId);
      return res.status(404).json({ 
        success: false,
        message: 'Feature not found' 
      });
    }

    const page = await AgentPage.findOne({ _id: feature.pageId, ownerId: req.user._id });
    if (!page) {
      console.error('[Feature Controller] Page not found:', { pageId: feature.pageId, userId: req.user._id });
      return res.status(404).json({ 
        success: false,
        message: 'Agent page not found' 
      });
    }

    // Default: delete feature-tied agents to avoid ghost agents/orphaned threads
    const deleteAgents = req.query.deleteAgents !== 'false';
    
    console.log('[Feature Controller] [DB WRITE] Deleting feature:', featureId, 'Delete agents:', deleteAgents);
    await deleteFeature(featureId, deleteAgents);
    console.log('[Feature Controller] [DB WRITE] Feature deleted successfully');

    // Note: deletion cascade already removes feature-linked messages/data.

    return res.json({ 
      success: true,
      message: 'Feature deleted successfully' 
    });
  } catch (err) {
    console.error('[Feature Controller] Error deleting feature:', {
      error: err.message,
      stack: err.stack,
      featureId: req.params.featureId
    });
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to delete feature'
    });
  }
};
