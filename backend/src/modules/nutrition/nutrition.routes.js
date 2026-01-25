const router = require('express').Router();
const auth = require('../../middleware/auth');
const nutritionController = require('./controllers/nutrition.controller');

// Nutrition context routes
router.get('/context', auth, nutritionController.getContext);
router.put('/context', auth, nutritionController.updateContext);

// Nutrition logs routes
router.get('/logs', auth, nutritionController.getLogs);
router.post('/logs', auth, nutritionController.addLog);

// Daily targets routes
router.put('/targets', auth, nutritionController.updateTargets);

module.exports = router;

