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
 * Delete an agent page
 */
const deleteAgentPage = async (pageId, ownerId) => {
  // Delete associated agents first
  await Agent.deleteMany({ pageId });
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

module.exports = {
  getAgentPages,
  getAgentPageById,
  createAgentPage,
  updateAgentPage,
  deleteAgentPage,
  addAgent,
  getAgents
};
