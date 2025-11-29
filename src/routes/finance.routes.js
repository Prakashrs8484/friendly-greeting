const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const finance = require('../controllers/finance.controller');

router.post('/expense', auth, finance.addExpense);
router.get('/expense', auth, finance.listExpenses);
router.post('/income', auth, finance.addIncome);
router.get('/income', auth, finance.listIncome);
router.post('/goal', auth, finance.addGoal);
router.get('/goal', auth, finance.listGoals);
router.get('/stats', auth, finance.getStats);

module.exports = router;
