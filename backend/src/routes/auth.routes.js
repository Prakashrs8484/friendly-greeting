const r = require('express').Router();
const c = require('../controllers/auth.controller');
r.post('/signup', c.signup);
r.post('/signin', c.signin);
module.exports = r;
