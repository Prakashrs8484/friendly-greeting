const express = require('express');
const auth = require('../../middleware/auth');
const fitnessEntryController = require('./controllers/fitnessEntry.controller');
const fitnessDailyMetricController = require('./controllers/fitnessDailyMetric.controller');
const fitnessProfileController = require('./controllers/fitnessProfile.controller');
const fitnessChatInputController = require('./controllers/fitnessChatInput.controller');
const fitnessChatController = require('./controllers/fitnessChat.controller');
const fitnessTimelineController = require('./controllers/fitnessTimeline.controller');
const fitnessGoalsController = require('./controllers/fitnessGoals.controller');
const fitnessRecoveryController = require('./controllers/fitnessRecovery.controller');
const fitnessInsightsController = require('./controllers/fitnessInsights.controller');
const fitnessAnalyticsController = require('./controllers/fitnessAnalytics.controller');
const fitnessResetController = require('./controllers/fitnessReset.controller');
const fitnessCommandController = require('./controllers/fitnessCommand.controller');

const router = express.Router();

// All routes require authentication
router.use(auth);

// ===== ENTRY ROUTES (Legacy quick-add endpoints) =====
// Add entries
router.post('/entry/meal', fitnessEntryController.addMeal);
router.post('/entry/workout', fitnessEntryController.addWorkout);
router.post('/entry/sleep', fitnessEntryController.addSleep);
router.post('/entry/hydration', fitnessEntryController.addHydration);
router.post('/entry/activity', fitnessEntryController.addActivity);
router.post('/entry/recovery', fitnessEntryController.addRecovery);

// ===== TIMELINE ROUTES (Primary CRUD API) =====
// GET /api/fitness/timeline?date=YYYY-MM-DD - Get all entries for a date, sorted chronologically
router.get('/timeline', fitnessTimelineController.getTimelineByDate);
// POST /api/fitness/timeline - Create new entry (triggers metric recomputation)
router.post('/timeline', fitnessTimelineController.createEntry);
// PUT /api/fitness/timeline/:entryId - Update entry (triggers metric recomputation)
router.put('/timeline/:entryId', fitnessTimelineController.updateEntry);
// DELETE /api/fitness/timeline/:entryId - Delete entry (triggers metric recomputation)
router.delete('/timeline/:entryId', fitnessTimelineController.deleteEntry);

// ===== DAILY METRIC ROUTES =====
router.post('/metric/recompute/:dateKey', fitnessDailyMetricController.recomputeAndReturn);
router.get('/metric/:dateKey', fitnessDailyMetricController.getDailyMetric);
router.get('/dashboard', fitnessDailyMetricController.getDashboard);

// ===== GOALS ROUTES =====
// GET /api/fitness/goals - Get user's current goals
router.get('/goals', fitnessGoalsController.getGoals);
// PUT /api/fitness/goals - Update user's goals
router.put('/goals', fitnessGoalsController.updateGoals);
// GET /api/fitness/goals/progress?date=YYYY-MM-DD - Get progress toward goals (dynamic calculations)
router.get('/goals/progress', fitnessGoalsController.getGoalsProgress);
// GET /api/fitness/goals/defaults?mode=GOAL_MODE - Get default targets for a goal mode
router.get('/goals/defaults', fitnessGoalsController.getDefaultTargets);

// ===== RECOVERY ROUTES =====
// GET /api/fitness/recovery?date=YYYY-MM-DD - Get recovery data with signals, scores, and recommendations
router.get('/recovery', fitnessRecoveryController.getRecoveryData);
// POST /api/fitness/recovery/signals - Record recovery signals (muscleSoreness, stressLevel, HR, etc)
router.post('/recovery/signals', fitnessRecoveryController.addRecoverySignals);
// GET /api/fitness/recovery/trend?start=YYYY-MM-DD&end=YYYY-MM-DD - Get recovery trend
router.get('/recovery/trend', fitnessRecoveryController.getRecoveryTrend);

// ===== INSIGHTS ROUTES =====
// GET /api/fitness/insights?date=YYYY-MM-DD - Get AI-powered insights with coach advice, meal suggestions, workout recommendations, food swaps
router.get('/insights', fitnessInsightsController.getInsights);

// ===== ANALYTICS ROUTES =====
// GET /api/fitness/analytics/weekly?endDate=YYYY-MM-DD - Get 7-day weekly analytics with summary and trends
router.get('/analytics/weekly', fitnessAnalyticsController.getWeeklyAnalytics);
// GET /api/fitness/analytics/trends?from=YYYY-MM-DD&to=YYYY-MM-DD - Get trend analytics across custom date range
router.get('/analytics/trends', fitnessAnalyticsController.getTrendAnalytics);

// ===== PROFILE ROUTES =====
router.get('/profile', fitnessProfileController.getProfile);
router.put('/profile', fitnessProfileController.updateProfile);

// ===== CHAT INPUT ROUTES =====
router.post('/chat', fitnessChatController.handleChat);
router.post('/chat/input', fitnessChatInputController.handleChatInput);
router.post('/command', fitnessCommandController.handleCommand);

// ===== DAY RESET ROUTES =====
// POST /api/fitness/day/reset - Hard-delete all entries and metric for a date
router.post('/day/reset', fitnessResetController.resetDay);
// POST /api/fitness/day/soft-reset - Soft-delete (archive) entries for a date
router.post('/day/soft-reset', fitnessResetController.softResetDay);
// GET /api/fitness/day/deleted?date=YYYY-MM-DD - Get soft-deleted entries for a date
router.get('/day/deleted', fitnessResetController.getDeletedEntries);
// POST /api/fitness/day/restore - Restore soft-deleted entries and recompute metrics
router.post('/day/restore', fitnessResetController.restoreDay);
// GET /api/fitness/day/reset-history?days=30 - Get audit trail of deleted days
router.get('/day/reset-history', fitnessResetController.getResetHistory);
// DELETE /api/fitness/day/purge-deleted?olderThanDays=30 - Permanently purge soft-deleted entries
router.delete('/day/purge-deleted', fitnessResetController.purgeSoftDeleted);

module.exports = router;
