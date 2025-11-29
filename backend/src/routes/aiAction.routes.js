const r = require('express').Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/aiAction.controller');

r.get('/preview', auth, controller.previewActions);
r.post('/apply', auth, controller.applyAction);
r.post('/apply-all', auth, controller.applyAll);

module.exports = r;
