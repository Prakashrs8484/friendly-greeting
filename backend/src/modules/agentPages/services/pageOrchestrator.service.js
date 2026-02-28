/**
 * Page Orchestrator Service
 * 
 * Lightweight orchestration layer per Agent Page that:
 * - Loads page memory from DB
 * - Loads feature data from DB
 * - Dispatches feature events to the correct agents
 * - Controls which agent is allowed to respond
 * - Ensures DB is the single source of truth
 */

const { getAgentHistory, getPageLevelContext, saveMessage } = require('./message.service');
const { getPageFeatureData } = require('./featureData.service');
const { processPageFeatures } = require('./featureAI.service');
const Feature = require('../models/feature.model');
const Agent = require('../models/agent.model');

/**
 * Turn raw featureData into compact facts for prompting (internal-only).
 * @param {Array} featureData - Output of getPageFeatureData(pageId)
 * @returns {Object} facts keyed by featureType
 */
const buildFeatureFacts = (featureData = []) => {
  const factsByType = {};

  for (const fd of featureData) {
    const type = fd.featureType || 'unknown';
    const data = fd.data;
    const items = Array.isArray(data) ? data : (data ? [data] : []);

    const base = {
      count: items.length,
      updatedAt: fd.updatedAt || null
    };

    if (type === 'todo') {
      const completed = items.filter(i => i && i.completed).length;
      factsByType[type] = { ...base, completed, open: Math.max(0, items.length - completed) };
      continue;
    }

    if (type === 'research-tracker') {
      const active = items.filter(i => i && i.status === 'active').length;
      const completed = items.filter(i => i && i.status === 'completed').length;
      factsByType[type] = { ...base, active, completed };
      continue;
    }

    factsByType[type] = base;
  }

  return factsByType;
};

/**
 * Load complete page context from DB (memory + features)
 * This is the single source of truth for page state
 * @param {string} pageId - The Agent Page ID
 * @returns {Promise<Object>} Complete page context
 */
const loadPageContext = async (pageId) => {
  console.log('[Page Orchestrator] Loading page context from DB:', pageId);
  
  // Load page-level memory (agentId = null)
  const pageLevelMessages = await getPageLevelContext(pageId, 20);
  console.log('[Page Orchestrator] Loaded page-level messages:', pageLevelMessages.length);
  
  // Load all feature data from DB
  const featureData = await getPageFeatureData(pageId);
  console.log('[Page Orchestrator] Loaded feature data:', featureData.length, 'features');
  
  // Generate feature summaries (reads from DB, writes summaries to DB)
  const featureSummaries = await processPageFeatures(pageId);
  console.log('[Page Orchestrator] Generated feature summaries:', featureSummaries.length);
  
  return {
    pageLevelMessages,
    featureData,
    featureSummaries
  };
};

/**
 * Load agent-specific context (agent history + page context)
 * @param {string} pageId - The Agent Page ID
 * @param {string} agentId - The Agent ID
 * @returns {Promise<Object>} Agent context with history and page context
 */
const loadAgentContext = async (pageId, agentId) => {
  console.log('[Page Orchestrator] Loading agent context:', { pageId, agentId });
  
  // Load agent's chat history from DB
  const agentHistory = await getAgentHistory(pageId, agentId, 20);
  console.log('[Page Orchestrator] Loaded agent history:', agentHistory.length, 'messages');
  
  // Load page context (shared across all agents)
  const pageContext = await loadPageContext(pageId);

  // Build compact feature facts for internal prompting (do not show verbatim in outputs)
  const featureFacts = buildFeatureFacts(pageContext.featureData || []);
  console.log('[Page Orchestrator] Built feature facts for types:', Object.keys(featureFacts));
  
  return {
    agentHistory,
    pageContext: {
      pageLevelMessages: pageContext.pageLevelMessages,
      featureSummaries: pageContext.featureSummaries,
      featureFacts
    }
  };
};

/**
 * Handle feature event (add/edit/delete)
 * - Persist data to DB
 * - Trigger feature-bound agents
 * - Generate AI insights using stored data
 * - Save insights back to DB
 * @param {string} pageId - The Agent Page ID
 * @param {string} featureId - The Feature ID
 * @param {string} eventType - 'created', 'updated', 'deleted'
 * @param {Object} eventData - Event-specific data
 */
const handleFeatureEvent = async (pageId, featureId, eventType, eventData = {}) => {
  console.log('[Page Orchestrator] Feature event:', { pageId, featureId, eventType, eventData });
  
  try {
    // Load feature from DB
    const feature = await Feature.findOne({ _id: featureId, pageId }).lean();
    if (!feature) {
      console.error('[Page Orchestrator] Feature not found:', featureId);
      return;
    }
    
    console.log('[Page Orchestrator] Feature found:', feature.name, 'Type:', feature.type, 'Agents:', feature.agentIds?.length || 0);
    
    // Generate insights from DB-backed feature data
    const featureData = await getPageFeatureData(pageId);
    const currentFeatureData = featureData.find(fd => fd.featureId === featureId.toString());
    
    if (currentFeatureData && currentFeatureData.data && Array.isArray(currentFeatureData.data) && currentFeatureData.data.length > 0) {
      // Process features to update summaries in DB
      await processPageFeatures(pageId);
      console.log('[Page Orchestrator] Feature summaries updated in DB');
      
      // If feature has bound agents, notify them (for future agent-to-agent communication)
      if (feature.agentIds && feature.agentIds.length > 0) {
        console.log('[Page Orchestrator] Feature has', feature.agentIds.length, 'bound agent(s)');
        // Future: Trigger agents with feature context
        // For now, agents will see updated summaries via page context
      }
    }
    
    // Save feature event to page-level memory
    const eventMessage = `Feature "${feature.name}" (${feature.type}) was ${eventType}.`;
    await saveMessage(pageId, null, 'agent', eventMessage, 'feature', feature._id);
    console.log('[Page Orchestrator] Feature event saved to page memory');
    
  } catch (err) {
    console.error('[Page Orchestrator] Error handling feature event:', err);
    throw err;
  }
};

/**
 * Verify agent is allowed to respond (only selected agent responds)
 * @param {string} pageId - The Agent Page ID
 * @param {string} agentId - The Agent ID attempting to respond
 * @returns {Promise<boolean>} True if agent is allowed to respond
 */
const canAgentRespond = async (pageId, agentId) => {
  // Verify agent exists and belongs to page
  const agent = await Agent.findOne({ _id: agentId, pageId }).lean();
  if (!agent) {
    console.warn('[Page Orchestrator] Agent not found or not on page:', { pageId, agentId });
    return false;
  }
  
  console.log('[Page Orchestrator] Agent authorized to respond:', agent.name);
  return true;
};

/**
 * Get agents bound to a feature
 * @param {string} pageId - The Agent Page ID
 * @param {string} featureId - The Feature ID
 * @returns {Promise<Array>} Array of agent objects
 */
const getFeatureAgents = async (pageId, featureId) => {
  const feature = await Feature.findOne({ _id: featureId, pageId }).lean();
  if (!feature || !feature.agentIds || feature.agentIds.length === 0) {
    return [];
  }
  
  const agents = await Agent.find({ _id: { $in: feature.agentIds }, pageId }).lean();
  console.log('[Page Orchestrator] Found', agents.length, 'agent(s) bound to feature:', feature.name);
  return agents;
};

module.exports = {
  loadPageContext,
  loadAgentContext,
  handleFeatureEvent,
  canAgentRespond,
  getFeatureAgents
};
