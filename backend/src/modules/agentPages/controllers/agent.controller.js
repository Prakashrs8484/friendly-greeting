const {
  addAgent,
  getAgents
} = require('../services/agentPage.service');

const {
  executeAgent,
  getExecutionHistory,
  updateAgentStage
} = require('../services/agentExecution.service');

const {
  saveMessage,
  getAgentHistory,
  getPageLevelContext,
  getMessagesForAgent,
  getPageMessages
} = require('../services/message.service');

const {
  processPageFeatures
} = require('../services/featureAI.service');

const {
  loadAgentContext,
  canAgentRespond
} = require('../services/pageOrchestrator.service');

/**
 * Get all agents for a specific agent page
 */
exports.getAgents = async (req, res) => {
  try {
    const agents = await getAgents(req.params.pageId, req.user._id);
    if (agents === null) {
      return res.status(404).json({ message: 'Agent page not found' });
    }
    return res.json(agents);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Create a new agent for an agent page
 */
exports.createAgent = async (req, res) => {
  try {
    const agent = await addAgent(req.params.pageId, req.user._id, req.body);
    return res.status(201).json(agent);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Execute an agent (only the selected agent responds)
 * CHAT → DB → AGENT FLOW:
 * 1. Save user message to DB (pageId + agentId)
 * 2. Load agent-specific history from DB
 * 3. Load page-level context from DB
 * 4. Execute ONLY the selected agent
 * 5. Save agent response to DB
 * 6. Return response to frontend
 */
exports.executeAgent = async (req, res) => {
  const startTime = Date.now();
  const pageId = req.params.pageId;
  const agentId = req.params.agentId;
  const userInput = req.body.input;

  console.log('[Agent Controller] ===== AGENT EXECUTION START =====');
  console.log('[Agent Controller] Input:', { pageId, agentId, userInput: userInput?.substring(0, 100) });

  try {
    // Verify agent exists and is authorized
    const Agent = require('../models/agent.model');
    const agent = await Agent.findById(agentId);
    if (!agent) {
      console.error('[Agent Controller] Agent not found:', agentId);
      return res.status(404).json({ message: 'Agent not found' });
    }

    // Verify agent is allowed to respond (orchestrator check)
    const authorized = await canAgentRespond(pageId, agentId);
    if (!authorized) {
      console.error('[Agent Controller] Agent not authorized to respond:', agentId);
      return res.status(403).json({ message: 'Agent not authorized' });
    }

    if (!userInput || !userInput.trim()) {
      console.log('[Agent Controller] Empty input, returning default message');
      return res.status(200).json({ response: "Please send a message." });
    }

    // 1. DB WRITE: Store user message in this agent's thread
    console.log('[Agent Controller] [DB WRITE] Saving user message to MongoDB...');
    const userMessage = await saveMessage(pageId, agentId, 'user', userInput.trim(), 'chat');
    console.log('[Agent Controller] [DB WRITE] User message saved:', userMessage._id);

    // 2. DB READ: Load agent context via orchestrator (history + page context)
    console.log('[Agent Controller] [DB READ] Loading agent context from MongoDB...');
    const agentContext = await loadAgentContext(pageId, agentId);
    const { agentHistory, pageContext } = agentContext;
    console.log('[Agent Controller] [DB READ] Loaded:', {
      agentHistory: agentHistory.length,
      pageLevelMessages: pageContext.pageLevelMessages.length,
      featureSummaries: pageContext.featureSummaries.length
    });

    // 3. AI EXECUTION: Execute only this agent with DB-backed context
    console.log('[Agent Controller] [AI EXECUTION] Executing agent:', agent.name, 'Role:', agent.config?.role);
    console.log('[Agent Controller] [AI EXECUTION] Input context:', {
      hasHistory: agentHistory.length > 0,
      hasPageContext: pageContext.pageLevelMessages.length > 0,
      hasFeatures: pageContext.featureSummaries.length > 0
    });
    
    const executionResult = await executeAgent(agent, userInput.trim(), agentHistory, pageContext);
    // Handle both object format {response, newStage} and string format (backward compat)
    const generatedText = typeof executionResult === 'string' ? executionResult : (executionResult.response || '');
    const newStage = typeof executionResult === 'object' && executionResult.newStage ? executionResult.newStage : null;
    console.log('[Agent Controller] [AI EXECUTION] Generated response length:', generatedText.length, 'New stage:', newStage);

    // 3b. DB WRITE: Update agent stage if changed (CRITICAL: before saving response)
    if (newStage) {
      console.log('[Agent Controller] [DB WRITE] Updating agent stage to:', newStage);
      await updateAgentStage(agentId, newStage);
    }

    // 4. DB WRITE: Store agent response in same thread
    console.log('[Agent Controller] [DB WRITE] Saving agent response to MongoDB...');
    const agentMessage = await saveMessage(pageId, agent._id, 'agent', generatedText, 'chat');
    console.log('[Agent Controller] [DB WRITE] Agent response saved:', agentMessage._id);

    const duration = Date.now() - startTime;
    console.log('[Agent Controller] ===== AGENT EXECUTION COMPLETE =====', `(${duration}ms)`);

    return res.status(200).json({ response: generatedText });
  } catch (err) {
    const duration = Date.now() - startTime;
    console.error('[Agent Controller] ===== AGENT EXECUTION ERROR =====');
    console.error('[Agent Controller] Error:', err.message);
    console.error('[Agent Controller] Stack:', err.stack);
    console.error('[Agent Controller] Duration:', `${duration}ms`);
    return res.status(200).json({ response: "I'm ready to help. Please send a message." });
  }
};

/**
 * Get execution history for an agent
 */
exports.getExecutionHistory = async (req, res) => {
  try {
    const history = await getExecutionHistory(req.params.agentId);
    return res.json(history);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * Get messages for display.
 * - If agentId query param is set: return only that agent's chat thread (for frontend when an agent is selected).
 * - Otherwise: return all messages for the page (backward compat).
 */
exports.getPageMessages = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const pageId = req.params.pageId;
    const agentId = req.query.agentId;

    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Agent page not found' });
    }

    const messages = agentId
      ? await getMessagesForAgent(pageId, agentId, 50)
      : await getPageMessages(pageId, 50);
    console.log('[Messages Controller] Found', messages.length, 'messages', agentId ? `for agent ${agentId}` : 'for page');

    return res.json({ success: true, messages });
  } catch (err) {
    console.error('[Messages Controller] Error getting messages:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to get messages' });
  }
};

/**
 * Clear chat history for a specific agent
 * DELETE /api/agent-pages/:pageId/agents/:agentId/messages
 */
exports.clearAgentMessages = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const Agent = require('../models/agent.model');
    const Message = require('../models/message.model');
    const pageId = req.params.pageId;
    const agentId = req.params.agentId;

    // Verify page belongs to user
    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Agent page not found' });
    }

    // Verify agent belongs to page
    const agent = await Agent.findOne({ _id: agentId, pageId });
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    // Delete all messages for this agent
    const result = await Message.deleteMany({ pageId, agentId });
    console.log('[Messages Controller] Cleared', result.deletedCount, 'messages for agent', agentId);

    // Reset agent stage to initial state
    const { updateAgentStage } = require('../services/agentExecution.service');
    await updateAgentStage(agentId, null);
    console.log('[Messages Controller] Reset agent stage');

    return res.json({ success: true, deletedCount: result.deletedCount, message: 'Agent chat history cleared' });
  } catch (err) {
    console.error('[Messages Controller] Error clearing agent messages:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to clear agent messages' });
  }
};

/**
 * Clear all page-level messages (page memory)
 * DELETE /api/agent-pages/:pageId/messages
 */
exports.clearPageMessages = async (req, res) => {
  try {
    const AgentPage = require('../models/agentPage.model');
    const Message = require('../models/message.model');
    const pageId = req.params.pageId;

    // Verify page belongs to user
    const page = await AgentPage.findOne({ _id: pageId, ownerId: req.user._id });
    if (!page) {
      return res.status(404).json({ success: false, message: 'Agent page not found' });
    }

    // Delete all messages for this page
    const result = await Message.deleteMany({ pageId });
    console.log('[Messages Controller] Cleared', result.deletedCount, 'messages for page', pageId);

    return res.json({ success: true, deletedCount: result.deletedCount, message: 'Page history cleared' });
  } catch (err) {
    console.error('[Messages Controller] Error clearing page messages:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to clear page messages' });
  }
};
