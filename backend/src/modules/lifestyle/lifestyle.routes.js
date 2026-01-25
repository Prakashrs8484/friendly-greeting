const router = require('express').Router();
const auth = require('../../middleware/auth');
const lifestyleController = require('./controllers/lifestyle.controller');

// Lifestyle context routes
router.get('/context', auth, lifestyleController.getContext);
router.put('/context', auth, lifestyleController.updateContext);

module.exports = router;
