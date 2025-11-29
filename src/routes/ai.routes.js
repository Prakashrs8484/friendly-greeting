const express = require('express');
const router = express.Router();
const ai = require('../controllers/ai.controller');
const auth = require('../middleware/auth');

router.post('/finance', auth, ai.financeChat);

module.exports = router;
