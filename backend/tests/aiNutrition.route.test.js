jest.mock('../src/middleware/auth', () => (req, res, next) => {
  req.user = { _id: 'mock-user-id' };
  next();
});

jest.mock('../src/modules/nutrition/models/NutritionContext', () => ({
  findOne: jest.fn()
}));

jest.mock('../src/modules/system/ai/services/nutritionMcpClient.service', () => ({
  invokeNutritionAnalyzeViaMcp: jest.fn()
}));

jest.mock('../src/modules/mcp/nutrition/services/nutritionAnalyzer.service', () => ({
  analyzeNutritionText: jest.fn()
}));

jest.mock('../src/modules/system/services/groq.service', () => ({
  chat: {
    completions: {
      create: jest.fn()
    }
  }
}));

const express = require('express');
const request = require('supertest');

const NutritionContext = require('../src/modules/nutrition/models/NutritionContext');
const groq = require('../src/modules/system/services/groq.service');
const { invokeNutritionAnalyzeViaMcp } = require('../src/modules/system/ai/services/nutritionMcpClient.service');
const { analyzeNutritionText } = require('../src/modules/mcp/nutrition/services/nutritionAnalyzer.service');
const aiRoutes = require('../src/modules/system/ai/ai.routes');

function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/ai', aiRoutes);
  return app;
}

describe('POST /api/ai/nutrition', () => {
  const originalUseMcp = process.env.USE_MCP_NUTRITION;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.USE_MCP_NUTRITION;

    NutritionContext.findOne.mockResolvedValue({ dietType: 'high-protein' });
    groq.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: 'Nutrition reply from AI' } }]
    });
  });

  afterAll(() => {
    if (originalUseMcp === undefined) {
      delete process.env.USE_MCP_NUTRITION;
    } else {
      process.env.USE_MCP_NUTRITION = originalUseMcp;
    }
  });

  it('returns MCP-backed analysis when MCP call succeeds', async () => {
    const mcpAnalysis = {
      items: [{ item: 'idli', quantity: 3, calories: 174, protein: 6 }],
      totals: { calories: 174, protein: 6 },
      unknownItems: []
    };

    invokeNutritionAnalyzeViaMcp.mockResolvedValue(mcpAnalysis);

    const app = createTestApp();
    const response = await request(app)
      .post('/api/ai/nutrition')
      .send({ message: '3 idli' });

    expect(response.status).toBe(200);
    expect(invokeNutritionAnalyzeViaMcp).toHaveBeenCalledWith('3 idli', expect.any(Object));
    expect(analyzeNutritionText).not.toHaveBeenCalled();

    expect(response.body).toEqual(
      expect.objectContaining({
        reply: 'Nutrition reply from AI',
        nutritionAnalysis: mcpAnalysis,
        mcpUsed: true,
        analysisSource: 'mcp'
      })
    );
  });

  it('returns fallback analysis when MCP call fails', async () => {
    const fallbackAnalysis = {
      items: [{ item: 'egg', quantity: 1, calories: 78, protein: 6.3 }],
      totals: { calories: 78, protein: 6.3 },
      unknownItems: []
    };

    invokeNutritionAnalyzeViaMcp.mockRejectedValue(new Error('MCP process unavailable'));
    analyzeNutritionText.mockReturnValue(fallbackAnalysis);

    const app = createTestApp();
    const response = await request(app)
      .post('/api/ai/nutrition')
      .send({ message: '1 egg' });

    expect(response.status).toBe(200);
    expect(invokeNutritionAnalyzeViaMcp).toHaveBeenCalled();
    expect(analyzeNutritionText).toHaveBeenCalledWith('1 egg');

    expect(response.body).toEqual(
      expect.objectContaining({
        reply: 'Nutrition reply from AI',
        nutritionAnalysis: fallbackAnalysis,
        mcpUsed: false,
        analysisSource: 'fallback'
      })
    );
  });

  it('returns 400 for empty message', async () => {
    const app = createTestApp();
    const response = await request(app)
      .post('/api/ai/nutrition')
      .send({ message: '   ' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: 'message is required and must be a non-empty string'
    });
  });
});
