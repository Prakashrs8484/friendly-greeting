const router = require('express').Router();
const auth = require('../../middleware/auth');
const agentPageController = require('./controllers/agentPage.controller');
const agentController = require('./controllers/agent.controller');
const featureController = require('./controllers/feature.controller');
const featurePlanController = require('./controllers/featurePlan.controller');

// Agent Pages routes
router.get('/', auth, agentPageController.getAgentPages);
router.post('/', auth, agentPageController.createAgentPage);

// Feature routes (auto-generated features) - MUST come before :pageId route
router.post('/:pageId/features', auth, featureController.createFeature);
router.get('/:pageId/features', auth, featureController.getPageFeatures);
router.delete('/:pageId/features/:featureId', auth, featureController.deleteFeature);

// Feature plan routes
router.get('/:pageId/feature-plans', auth, featurePlanController.getPageFeaturePlans);
router.post('/:pageId/feature-plans', auth, featurePlanController.createFeaturePlan);

// Feature data routes
const featureDataController = require('./controllers/featureData.controller');
router.put('/:pageId/features/:featureId/data', auth, featureDataController.updateFeatureData);
router.get('/:pageId/features/:featureId/data', auth, featureDataController.getFeatureData);
router.get('/:pageId/features/:featureId/insights', auth, featureDataController.getFeatureInsights);

// Agents routes (nested under agent pages) - MUST come before :pageId route
router.get('/:pageId/agents', auth, agentController.getAgents);
router.post('/:pageId/agents', auth, agentController.createAgent);

// Agent execution routes
router.post('/:pageId/agents/:agentId/execute', auth, agentController.executeAgent);
router.get('/:pageId/agents/:agentId/history', auth, agentController.getExecutionHistory);

// Page-level conversation memory routes
router.get('/:pageId/messages', auth, agentController.getPageMessages);
router.delete('/:pageId/messages', auth, agentController.clearPageMessages);
router.delete('/:pageId/agents/:agentId/messages', auth, agentController.clearAgentMessages);

// Agent Page CRUD routes (catch-all :pageId routes come last)
router.get('/:pageId', auth, agentPageController.getAgentPage);
router.put('/:pageId', auth, agentPageController.updateAgentPage);
router.delete('/:pageId', auth, agentPageController.deleteAgentPage);

module.exports = router;
