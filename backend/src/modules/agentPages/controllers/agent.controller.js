const {
  addAgent,
  getAgents
} = require('../services/agentPage.service');

const {
  executeAgent,
  getExecutionHistory
} = require('../services/agentExecution.service');

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
 * Execute an agent
 */
exports.executeAgent = async (req, res) => {
  try {
    // Fetch agent configuration first
    const Agent = require('../models/agent.model');
    const agent = await Agent.findById(req.params.agentId);
    if (!agent) {
      return res.status(404).json({ message: 'Agent not found' });
    }

    const result = await executeAgent(agent, req.body.input);
    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
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
