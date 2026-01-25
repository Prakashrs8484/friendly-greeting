const router = require('express').Router();
const auth = require('../../middleware/auth');
const healthController = require('./controllers/health.controller');

// Health context routes
router.get('/context', auth, healthController.getContext);
router.put('/context', auth, healthController.updateContext);

// Health metrics routes
router.get('/metrics', auth, healthController.getMetrics);
router.put('/metrics', auth, healthController.updateMetrics);

// Workout routes
router.get('/workouts', auth, healthController.getWorkouts);
router.post('/workouts', auth, healthController.addWorkout);

// Recovery routes
router.get('/recovery', auth, healthController.getRecovery);

module.exports = router;

