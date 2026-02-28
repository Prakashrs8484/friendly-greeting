const FeatureData = require('../models/featureData.model');

/**
 * Feature Data Service
 * Manages CRUD operations for feature-specific data
 */

/**
 * Get or create feature data document
 */
const getOrCreateFeatureData = async (pageId, featureId, featureType) => {
  let featureData = await FeatureData.findOne({ pageId, featureId });
  
  if (!featureData) {
    featureData = new FeatureData({
      pageId,
      featureId,
      featureType,
      data: []
    });
    await featureData.save();
  }
  
  return featureData;
};

/**
 * Update feature data
 */
const updateFeatureData = async (pageId, featureId, featureType, data) => {
  const featureData = await getOrCreateFeatureData(pageId, featureId, featureType);
  
  featureData.data = data;
  featureData.updatedAt = new Date();
  // Clear AI summary when data changes (will be regenerated)
  featureData.aiSummary = '';
  featureData.aiSummaryUpdatedAt = null;
  
  await featureData.save();
  return featureData;
};

/**
 * Get feature data
 */
const getFeatureData = async (pageId, featureId) => {
  return await FeatureData.findOne({ pageId, featureId }).lean();
};

/**
 * Get all feature data for a page (for AI context)
 */
const getPageFeatureData = async (pageId) => {
  const allFeatureData = await FeatureData.find({ pageId }).lean();
  
  return allFeatureData.map(fd => ({
    featureId: fd.featureId.toString(),
    featureType: fd.featureType,
    data: fd.data,
    aiSummary: fd.aiSummary,
    updatedAt: fd.updatedAt
  }));
};

/**
 * Update AI summary for feature data
 */
const updateAISummary = async (pageId, featureId, summary) => {
  await FeatureData.findOneAndUpdate(
    { pageId, featureId },
    {
      aiSummary: summary,
      aiSummaryUpdatedAt: new Date()
    }
  );
};

module.exports = {
  getOrCreateFeatureData,
  updateFeatureData,
  getFeatureData,
  getPageFeatureData,
  updateAISummary
};
