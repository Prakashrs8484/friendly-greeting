const AgentPage = require('../models/agentPage.model');
const Agent = require('../models/agent.model');

/**
 * Get all agent pages for a user
 */
const getAgentPages = async (ownerId) => {
  return await AgentPage.find({ ownerId }).populate('agents');
};

/**
 * Get a specific agent page by ID
 */
const getAgentPageById = async (pageId, ownerId) => {
  return await AgentPage.findOne({ _id: pageId, ownerId }).populate('agents');
};

/**
 * Create a new agent page
 */
const createAgentPage = async (ownerId, data) => {
  const agentPage = new AgentPage({
    ownerId,
    name: data.name,
    description: data.description,
    icon: data.icon,
    pageConfig: data.pageConfig || {}
  });
  return await agentPage.save();
};

/**
 * Update an agent page
 */
const updateAgentPage = async (pageId, ownerId, data) => {
  return await AgentPage.findOneAndUpdate(
    { _id: pageId, ownerId },
    {
      ...data,
      updatedAt: Date.now()
    },
    { new: true }
  ).populate('agents');
};

/**
 * Delete an agent page with full cascade cleanup
 * Removes: agents, features, feature data, feature plans, and all messages
 */
const deleteAgentPage = async (pageId, ownerId) => {
  const Feature = require('../models/feature.model');
  const FeatureData = require('../models/featureData.model');
  const FeaturePlan = require('../models/featurePlan.model');
  const Message = require('../models/message.model');

  // 1. Find all features for this page (we'll need their IDs for cascade)
  const features = await Feature.find({ pageId });
  const featureIds = features.map(f => f._id);

  // 2. Delete all FeatureData docs for all features in this page
  if (featureIds.length > 0) {
    await FeatureData.deleteMany({ featureId: { $in: featureIds } });
  }

  // 3. Delete all FeaturePlan docs for this page
  await FeaturePlan.deleteMany({ pageId });

  // 4. Delete all Messages for this page (both page-level and agent-level, including feature-linked)
  await Message.deleteMany({ pageId });

  // 5. Delete all Features for this page
  await Feature.deleteMany({ pageId });

  // 6. Delete all Agents for this page
  await Agent.deleteMany({ pageId });

  // 7. Delete the page itself
  return await AgentPage.findOneAndDelete({ _id: pageId, ownerId });
};

/**
 * Add an agent to an agent page
 */
const addAgent = async (pageId, ownerId, agentData) => {
  const agent = new Agent({
    pageId,
    name: agentData.name,
    description: agentData.description || '',
    // Handle both old format (direct fields) and new format (config object)
    config: agentData.config || {
      role: agentData.role,
      tone: agentData.tone,
      creativity: agentData.creativity,
      verbosity: agentData.verbosity,
      memoryEnabled: agentData.memoryEnabled || false
    }
  });
  const savedAgent = await agent.save();

  // Add to page's agents array
  await AgentPage.findOneAndUpdate(
    { _id: pageId, ownerId },
    { $push: { agents: savedAgent._id }, updatedAt: Date.now() }
  );

  return savedAgent;
};

/**
 * Get agents for a page
 */
const getAgents = async (pageId, ownerId) => {
  // Verify page belongs to user
  const page = await AgentPage.findOne({ _id: pageId, ownerId });
  if (!page) return null;

  return await Agent.find({ pageId });
};

/**
 * Get aggregated workspace data for the workspace renderer
 * Returns: page + agents + features + feature plans + feature data summaries
 * Designed to be called once on workspace load to avoid race conditions
 */
const getWorkspaceData = async (pageId, ownerId) => {
  const Feature = require('../models/feature.model');
  const FeaturePlan = require('../models/featurePlan.model');
  const FeatureData = require('../models/featureData.model');

  // 1. Verify page belongs to user and load it
  const page = await AgentPage.findOne({ _id: pageId, ownerId }).populate('agents');
  if (!page) {
    return null;
  }

  // 2. Load all features for this page
  const features = await Feature.find({ pageId });

  // 3. Load all feature plans for this page
  const featurePlans = await FeaturePlan.find({ pageId });

  // 4. Load feature data summaries (for initial UI state)
  const featureDataRecords = await FeatureData.find({ pageId }).select('featureId featureType data aiSummary updatedAt');
  
  // 5. Aggregate feature data by feature ID
  const featureDataMap = {};
  featureDataRecords.forEach(fd => {
    if (!featureDataMap[fd.featureId]) {
      featureDataMap[fd.featureId] = [];
    }
    featureDataMap[fd.featureId].push({
      _id: fd._id,
      featureType: fd.featureType,
      itemCount: Array.isArray(fd.data) ? fd.data.length : 0,
      aiSummary: fd.aiSummary,
      updatedAt: fd.updatedAt
    });
  });

  // 6. Assemble workspace response
  return {
    page,
    agents: page.agents || [],
    features: features.map(f => ({
      ...f.toObject(),
      dataStats: featureDataMap[f._id.toString()] || []
    })),
    featurePlans,
    featureDataMap // For advanced UI state management
  };
};

module.exports = {
  getAgentPages,
  getAgentPageById,
  createAgentPage,
  updateAgentPage,
  deleteAgentPage,
  addAgent,
  getAgents,
  getWorkspaceData
};
