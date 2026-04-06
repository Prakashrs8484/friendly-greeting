const request = require('supertest');
const app = require('../../../backend/src/index');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

/**
 * Fitness Module Integration Tests (Jest + Supertest)
 * Tests cover: chat logging, timeline CRUD, daily recomputation, recovery, analytics, day reset
 */

// Mock user ID and auth token
const mockUserId = uuidv4();
const authToken = jwt.sign(
  { userId: mockUserId, email: 'test@example.com' },
  process.env.JWT_SECRET || 'test-secret'
);

const today = new Date().toISOString().split('T')[0];

describe('Fitness Module Integration Tests', () => {
  let createdEntryId;
  let secondEntryId;

  // ============ CHAT INPUT & PARSING TESTS ============
  describe('Chat Input - Natural Language Parsing', () => {
    it('should parse meal text and create entry', async () => {
      const response = await request(app)
        .post('/api/fitness/chat/input')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Had 2 idlis with sambar for breakfast, about 400 calories',
          date: today,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.parsedActions).toBeDefined();
      expect(response.body.createdEntries).toBeDefined();
      expect(response.body.createdEntries.length).toBeGreaterThan(0);
      expect(response.body.updatedDashboard).toBeDefined();
      expect(response.body.coachReply).toBeDefined();
    });

    it('should parse workout text and create entry', async () => {
      const response = await request(app)
        .post('/api/fitness/chat/input')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Did 45 minutes of running, burned about 500 calories',
          date: today,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.createdEntries.length).toBeGreaterThan(0);
      expect(response.body.createdEntries[0].entryType).toBe('workout');
    });

    it('should parse sleep text and create entry', async () => {
      const response = await request(app)
        .post('/api/fitness/chat/input')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Slept 8 hours last night, felt very refreshed',
          date: today,
        });

      expect(response.status).toBe(200);
      expect(response.body.createdEntries.length).toBeGreaterThan(0);
    });

    it('should parse hydration text and create entry', async () => {
      const response = await request(app)
        .post('/api/fitness/chat/input')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Drank 2 liters of water today',
          date: today,
        });

      expect(response.status).toBe(200);
      expect(response.body.createdEntries.length).toBeGreaterThan(0);
    });

    it('should return coachReply with encouraging message', async () => {
      const response = await request(app)
        .post('/api/fitness/chat/input')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Logged my workout today',
          date: today,
        });

      expect(response.status).toBe(200);
      expect(response.body.coachReply).toBeDefined();
      expect(typeof response.body.coachReply).toBe('string');
      expect(response.body.coachReply.length).toBeGreaterThan(0);
    });

    it('should auto-metric recomputation after chat input', async () => {
      // Get baseline
      const beforeRes = await request(app)
        .get(`/api/fitness/dashboard`)
        .set('Authorization', `Bearer ${authToken}`);

      const beforeMetric = beforeRes.body.dashboard.caloriesConsumed;

      // Log a meal
      await request(app)
        .post('/api/fitness/chat/input')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'Just ate a 600 calorie lunch',
          date: today,
        });

      // Check updated
      const afterRes = await request(app)
        .get(`/api/fitness/dashboard`)
        .set('Authorization', `Bearer ${authToken}`);

      const afterMetric = afterRes.body.dashboard.caloriesConsumed;

      expect(afterMetric).toBeGreaterThanOrEqual(beforeMetric);
    });
  });

  // ============ TIMELINE CRUD TESTS ============
  describe('Timeline - Create, Read, Update, Delete', () => {
    it('should create meal entry', async () => {
      const response = await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryType: 'meal',
          subtype: 'lunch',
          calories: 650,
          protein: 42,
          carbs: 55,
          fat: 22,
          description: 'Chicken dal rice',
          timestamp: new Date().toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.entry._id).toBeDefined();
      createdEntryId = response.body.entry._id;
    });

    it('should get timeline for date', async () => {
      const response = await request(app)
        .get(`/api/fitness/timeline?date=${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.entries).toBeInstanceOf(Array);
    });

    it('should update entry and trigger metric recomputation', async () => {
      // Create entry first
      const createRes = await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryType: 'meal',
          calories: 500,
          protein: 30,
          description: 'Breakfast',
          timestamp: new Date().toISOString(),
        });

      const entryId = createRes.body.entry._id;

      // Update entry
      const updateRes = await request(app)
        .put(`/api/fitness/timeline/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          calories: 600,
          protein: 35,
          description: 'Updated breakfast',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.entry.calories).toBe(600);
      expect(updateRes.body.entry.protein).toBe(35);

      // Verify metric updated
      const metricRes = await request(app)
        .get(`/api/fitness/dashboard`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(metricRes.body.dashboard.caloriesConsumed).toBeGreaterThanOrEqual(600);
    });

    it('should delete entry and trigger recomputation', async () => {
      // Create entry
      const createRes = await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryType: 'workout',
          workoutType: 'running',
          duration: 30,
          caloriesBurned: 300,
          timestamp: new Date().toISOString(),
        });

      const entryId = createRes.body.entry._id;

      // Get baseline metric
      const beforeRes = await request(app)
        .get(`/api/fitness/dashboard`)
        .set('Authorization', `Bearer ${authToken}`);

      const beforeBurned = beforeRes.body.dashboard.caloriesBurned;

      // Delete entry
      const deleteRes = await request(app)
        .delete(`/api/fitness/timeline/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verify metric recomputed (should decrease)
      const afterRes = await request(app)
        .get(`/api/fitness/dashboard`)
        .set('Authorization', `Bearer ${authToken}`);

      const afterBurned = afterRes.body.dashboard.caloriesBurned;
      expect(afterBurned).toBeLessThanOrEqual(beforeBurned);
    });

    it('should move entry across dates when timestamp changes', async () => {
      const createRes = await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryType: 'meal',
          calories: 400,
          description: 'Test meal',
          timestamp: new Date().toISOString(),
        });

      const entryId = createRes.body.entry._id;
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Update timestamp to tomorrow
      const updateRes = await request(app)
        .put(`/api/fitness/timeline/${entryId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timestamp: tomorrow.toISOString(),
        });

      expect(updateRes.status).toBe(200);
      const newDateKey = tomorrow.toISOString().split('T')[0];
      expect(updateRes.body.entry.dateKey).toBe(newDateKey);
    });
  });

  // ============ DAILY METRIC RECOMPUTATION TESTS ============
  describe('Daily Metrics - Aggregation & Recomputation', () => {
    it('should compute metric from entries', async () => {
      // Create multiple entries
      await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryType: 'meal',
          calories: 600,
          protein: 40,
          description: 'Lunch',
          timestamp: new Date().toISOString(),
        });

      await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryType: 'workout',
          duration: 45,
          caloriesBurned: 400,
          description: 'Morning run',
          timestamp: new Date().toISOString(),
        });

      // Get metric
      const response = await request(app)
        .get(`/api/fitness/metric/${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.caloriesConsumed).toBeGreaterThanOrEqual(600);
      expect(response.body.caloriesBurned).toBeGreaterThanOrEqual(400);
      expect(response.body.workoutMinutes).toBeGreaterThanOrEqual(45);
    });

    it('should calculate fitness score', async () => {
      const response = await request(app)
        .get(`/api/fitness/dashboard`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.dashboard.fitnessScore).toBeDefined();
      expect(response.body.dashboard.fitnessScore).toBeGreaterThanOrEqual(0);
      expect(response.body.dashboard.fitnessScore).toBeLessThanOrEqual(100);
    });

    it('should calculate recovery score', async () => {
      const response = await request(app)
        .get(`/api/fitness/dashboard`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.body.dashboard.recoveryScore).toBeDefined();
      expect(response.body.dashboard.recoveryScore).toBeGreaterThanOrEqual(0);
    });
  });

  // ============ RECOVERY TESTS ============
  describe('Recovery - Signals & Recommendations', () => {
    it('should add recovery signals', async () => {
      const response = await request(app)
        .post('/api/fitness/recovery/signals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          muscleSoreness: 3,
          stressLevel: 4,
          restingHeartRate: 62,
          energyLevel: 8,
          moodScore: 8,
          date: today,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.signals.muscleSoreness).toBe(3);
      expect(response.body.signals.stressLevel).toBe(4);
    });

    it('should get recovery data with recommendations', async () => {
      // Add signals first
      await request(app)
        .post('/api/fitness/recovery/signals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          muscleSoreness: 2,
          stressLevel: 3,
          restingHeartRate: 60,
          date: today,
        });

      // Get recovery data
      const response = await request(app)
        .get(`/api/fitness/recovery?date=${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.scores).toBeDefined();
      expect(response.body.scores.recoveryScore).toBeDefined();
      expect(response.body.recommendations).toBeInstanceOf(Array);
    });

    it('should generate recovery recommendations based on metrics', async () => {
      const response = await request(app)
        .get(`/api/fitness/recovery?date=${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.recommendations.length).toBeGreaterThan(0);
      expect(response.body.recommendations[0].title).toBeDefined();
      expect(response.body.recommendations[0].message).toBeDefined();
    });
  });

  // ============ ANALYTICS TESTS ============
  describe('Analytics - Weekly & Trends', () => {
    it('should get weekly analytics', async () => {
      const response = await request(app)
        .get(`/api/fitness/analytics/weekly?endDate=${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.period.days).toBe(7);
      expect(response.body.weekly).toBeDefined();
      expect(response.body.weekly.totalCaloriesConsumed).toBeDefined();
      expect(response.body.weekly.averageCaloriesConsumed).toBeDefined();
      expect(response.body.weekly.consistencyPercent).toBeDefined();
    });

    it('should get trend analytics for date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 14);
      const fromDate = startDate.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/fitness/analytics/trends?from=${fromDate}&to=${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.period.dayCount).toBe(15); // 14 days + today
      expect(response.body.trends).toBeDefined();
      expect(response.body.trends.consumed).toBeInstanceOf(Array);
      expect(response.body.trends.burned).toBeInstanceOf(Array);
    });

    it('should calculate goal achievement rates in analytics', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const fromDate = startDate.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/fitness/analytics/trends?from=${fromDate}&to=${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.summary.goalsMetTarget).toBeDefined();
      expect(response.body.summary.goalsMetTarget.proteinPercent).toBeDefined();
      expect(response.body.summary.goalsMetTarget.workoutPercent).toBeDefined();
    });

    it('should reject date range > 365 days', async () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 2);
      const fromDate = oldDate.toISOString().split('T')[0];

      const response = await request(app)
        .get(`/api/fitness/analytics/trends?from=${fromDate}&to=${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });
  });

  // ============ DAY RESET TESTS ============
  describe('Day Reset - Hard/Soft Delete & Restore', () => {
    it('should soft-reset a day (archive entries)', async () => {
      // Create entries first
      await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryType: 'meal',
          calories: 400,
          description: 'Test meal for reset',
          timestamp: new Date().toISOString(),
        });

      // Soft reset
      const response = await request(app)
        .post('/api/fitness/day/soft-reset')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: today });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.reset.deleted.entryCount).toBeGreaterThan(0);
      expect(response.body.reset.clearedPayload.caloriesConsumed).toBe(0);
    });

    it('should get deleted entries for audit', async () => {
      const response = await request(app)
        .get(`/api/fitness/day/deleted?date=${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.deletedCount).toBeGreaterThanOrEqual(0);
    });

    it('should restore soft-deleted day and recompute metrics', async () => {
      // Soft reset first
      await request(app)
        .post('/api/fitness/day/soft-reset')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: today });

      // Restore
      const response = await request(app)
        .post('/api/fitness/day/restore')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: today });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.restored.restored.metricRecomputed).toBe(true);
    });

    it('should get reset history for audit trail', async () => {
      const response = await request(app)
        .get(`/api/fitness/day/reset-history?days=30`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.resetHistory).toBeInstanceOf(Array);
    });

    it('should hard-reset a day (permanent delete)', async () => {
      // Get baseline
      const beforeRes = await request(app)
        .get(`/api/fitness/dashboard`)
        .set('Authorization', `Bearer ${authToken}`);

      const beforeCount = beforeRes.body.dashboard.entryCount || 0;

      // Create entry
      await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryType: 'meal',
          calories: 300,
          description: 'Meal to hard-delete',
          timestamp: new Date().toISOString(),
        });

      // Hard reset
      const resetRes = await request(app)
        .post('/api/fitness/day/reset')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ date: today });

      expect(resetRes.status).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(resetRes.body.reset.clearedPayload.caloriesConsumed).toBe(0);

      // Verify entries deleted
      const afterRes = await request(app)
        .get(`/api/fitness/timeline?date=${today}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(afterRes.body.entries.length).toBeLessThanOrEqual(beforeCount);
    });
  });

  // ============ AUTHENTICATION & ERROR TESTS ============
  describe('Authentication & Validation', () => {
    it('should reject request without auth token', async () => {
      const response = await request(app)
        .get(`/api/fitness/dashboard`);

      expect(response.status).toBe(401);
    });

    it('should reject invalid date format', async () => {
      const response = await request(app)
        .get(`/api/fitness/timeline?date=02-28-2026`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(400);
    });

    it('should reject missing required fields in timeline creation', async () => {
      const response = await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          // Missing entryType
          calories: 400,
        });

      expect(response.status).toBe(400);
    });

    it('should reject invalid entryType', async () => {
      const response = await request(app)
        .post('/api/fitness/timeline')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          entryType: 'invalid_type',
          calories: 400,
        });

      expect(response.status).toBe(400);
    });
  });
});
