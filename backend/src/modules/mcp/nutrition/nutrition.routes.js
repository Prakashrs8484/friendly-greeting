const router = require('express').Router();
const auth = require('../../../middleware/auth');
const nutritionController = require('./controllers/nutrition.controller');

router.post('/analyze', auth, nutritionController.analyze);

module.exports = router;
