jest.mock('../src/middleware/auth', () => (req, res, next) => {
  req.user = { _id: 'mock-user-id' };
  next();
});

const express = require('express');
const request = require('supertest');
const nutritionRouter = require('../src/modules/mcp/nutrition/nutrition.routes');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/mcp/nutrition', nutritionRouter);
  return app;
}

describe('MCP Nutrition analyze route', () => {
  it('returns 400 for missing text', async () => {
    const app = createTestApp();

    const response = await request(app)
      .post('/api/mcp/nutrition/analyze')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: 'text is required and must be a non-empty string'
      })
    );
  });

  it('returns deterministic totals and items for valid input', async () => {
    const app = createTestApp();

    const response = await request(app)
      .post('/api/mcp/nutrition/analyze')
      .send({ text: '3 idli and 1 scoop whey' });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        items: [
          expect.objectContaining({ item: 'idli', quantity: 3, calories: 174, protein: 6 }),
          expect.objectContaining({ item: 'whey', quantity: 1, calories: 120, protein: 24 })
        ],
        totals: { calories: 294, protein: 30 },
        unknownItems: []
      })
    );
  });
});
