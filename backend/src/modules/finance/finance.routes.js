const r = require('express').Router();
const auth = require('../../middleware/auth');
const c = require('./controllers/finance.controller');
r.post('/expense', auth, c.addExpense);
r.get('/expense', auth, c.listExpenses);
r.post('/income', auth, c.addIncome);
r.get('/income', auth, c.listIncome);
r.post('/goal', auth, c.addGoal);
r.get('/goal', auth, c.listGoals);
r.get('/context', auth, c.getContext);
r.get("/stats", auth, c.getStats);

module.exports = r;
