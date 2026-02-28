const {
  updateFeatureData,
  getFeatureData,
  getPageFeatureData
} = require('../services/featureData.service');

const {
  processPageFeatures,
  generateFeatureInsights
} = require('../services/featureAI.service');

const {
  handleFeatureEvent
} = require('../services/pageOrchestrator.service');

/**
 * Update feature data
 * FEATURE → DB → AGENT FLOW:
 * 1. Persist data to MongoDB
 * 2. Trigger feature event via orchestrator
 * 3. Generate AI insights using stored data
 * 4. Save insights back to DB
 * 5. Notify bound agents (via page context)
 */
exports.updateFeatureData = async (req, res) => {
  const startTime = Date.now();
  const pageId = req.params.pageId;
  const featureId = req.params.featureId;
  const { data } = req.body;

  console.log('[Feature Data Controller] ===== FEATURE UPDATE START =====');
  console.log('[Feature Data Controller] Input:', { pageId, featureId, dataLength: Array.isArray(data) ? data.length : 'N/A' });

  try {
    const AgentPage = require('../models/agentPage.model');
    const Feature = require('../models/feature.model');

    // Verify page belongs to user
    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      console.error('[Feature Data Controller] Page not found:', pageId);
      return res.status(404).json({ 
        success: false,
        message: 'Agent page not found' 
      });
    }

    // Verify feature belongs to page
    const feature = await Feature.findOne({ _id: featureId, pageId });
    if (!feature) {
      console.error('[Feature Data Controller] Feature not found:', featureId);
      return res.status(404).json({ 
        success: false,
        message: 'Feature not found' 
      });
    }

    // 1. DB WRITE: Persist feature data to MongoDB
    console.log('[Feature Data Controller] [DB WRITE] Saving feature data to MongoDB...');
    const featureData = await updateFeatureData(pageId, featureId, feature.type, data);
    console.log('[Feature Data Controller] [DB WRITE] Feature data saved:', featureData._id, 'Type:', feature.type, 'Items:', Array.isArray(data) ? data.length : 'N/A');

    // 2. FEATURE EVENT: Trigger orchestrator to handle feature update
    console.log('[Feature Data Controller] [FEATURE EVENT] Triggering feature event handler...');
    await handleFeatureEvent(pageId, featureId, 'updated', { dataLength: Array.isArray(data) ? data.length : 0 });
    console.log('[Feature Data Controller] [FEATURE EVENT] Feature event handled successfully');

    // 3. AI PROCESSING: Generate insights from DB-backed data (async, don't wait)
    processPageFeatures(pageId).catch(err => {
      console.error('[Feature Data Controller] [AI PROCESSING] Error processing features:', err);
    });

    const duration = Date.now() - startTime;
    console.log('[Feature Data Controller] ===== FEATURE UPDATE COMPLETE =====', `(${duration}ms)`);

    return res.json({
      success: true,
      featureData: {
        _id: featureData._id.toString(),
        pageId: featureData.pageId.toString(),
        featureId: featureData.featureId.toString(),
        featureType: featureData.featureType,
        data: featureData.data,
        updatedAt: featureData.updatedAt
      }
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error('[Feature Data Controller] ===== FEATURE UPDATE ERROR =====');
    console.error('[Feature Data Controller] Error:', err.message);
    console.error('[Feature Data Controller] Stack:', err.stack);
    console.error('[Feature Data Controller] Duration:', `${duration}ms`);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to update feature data'
    });
  }
};

/**
 * Get feature data
 */
exports.getFeatureData = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const Feature = require('../models/feature.model');
    const pageId = req.params.pageId;
    const featureId = req.params.featureId;

    // Verify page belongs to user
    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      return res.status(404).json({ 
        success: false,
        message: 'Agent page not found' 
      });
    }

    // Verify feature belongs to page
    const feature = await Feature.findOne({ _id: featureId, pageId });
    if (!feature) {
      return res.status(404).json({ 
        success: false,
        message: 'Feature not found' 
      });
    }

    const featureData = await getFeatureData(pageId, featureId);
    
    if (!featureData) {
      return res.json({
        success: true,
        featureData: {
          data: [],
          aiSummary: ''
        }
      });
    }

    return res.json({
      success: true,
      featureData: {
        _id: featureData._id.toString(),
        pageId: featureData.pageId.toString(),
        featureId: featureData.featureId.toString(),
        featureType: featureData.featureType,
        data: featureData.data || [],
        aiSummary: featureData.aiSummary || '',
        updatedAt: featureData.updatedAt
      }
    });
  } catch (err) {
    console.error('[Feature Data Controller] Error getting feature data:', err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to get feature data'
    });
  }
};

/**
 * Get AI insights for a feature
 */
exports.getFeatureInsights = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const Feature = require('../models/feature.model');
    const pageId = req.params.pageId;
    const featureId = req.params.featureId;

    // Verify page belongs to user
    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      return res.status(404).json({ 
        success: false,
        message: 'Agent page not found' 
      });
    }

    // Verify feature belongs to page
    const feature = await Feature.findOne({ _id: featureId, pageId });
    if (!feature) {
      return res.status(404).json({ 
        success: false,
        message: 'Feature not found' 
      });
    }

    const featureData = await getFeatureData(pageId, featureId);
    
    if (!featureData || !featureData.data || featureData.data.length === 0) {
      return res.json({
        success: true,
        insights: []
      });
    }

    const insights = generateFeatureInsights(feature.type, featureData.data);

    return res.json({
      success: true,
      insights: insights || []
    });
  } catch (err) {
    console.error('[Feature Data Controller] Error getting insights:', err);
    return res.status(500).json({ 
      success: false,
      message: err.message || 'Failed to get insights'
    });
  }
};
