const router = require('express').Router();
const auth = require('../../middleware/auth');
const agentPageController = require('./controllers/agentPage.controller');
const agentController = require('./controllers/agent.controller');

// Agent Pages routes
router.get('/', auth, agentPageController.getAgentPages);
router.post('/', auth, agentPageController.createAgentPage);
router.get('/:pageId', auth, agentPageController.getAgentPage);
router.put('/:pageId', auth, agentPageController.updateAgentPage);
router.delete('/:pageId', auth, agentPageController.deleteAgentPage);

// Agents routes (nested under agent pages)
router.get('/:pageId/agents', auth, agentController.getAgents);
router.post('/:pageId/agents', auth, agentController.createAgent);

// Agent execution routes
router.post('/:pageId/agents/:agentId/execute', auth, agentController.executeAgent);
router.get('/:pageId/agents/:agentId/history', auth, agentController.getExecutionHistory);

module.exports = router;
