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

const NutritionContext = require('../src/modules/nutrition/models/NutritionContext');
const groq = require('../src/modules/system/services/groq.service');
const { invokeNutritionAnalyzeViaMcp } = require('../src/modules/system/ai/services/nutritionMcpClient.service');
const { analyzeNutritionText } = require('../src/modules/mcp/nutrition/services/nutritionAnalyzer.service');
const aiController = require('../src/modules/system/ai/controllers/ai.controller');

function mockResponse() {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('nutritionChat MCP bridge', () => {
  const originalUseMcp = process.env.USE_MCP_NUTRITION;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.USE_MCP_NUTRITION;

    NutritionContext.findOne.mockResolvedValue({ dietType: 'vegetarian' });
    groq.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: 'Here is your nutrition summary' } }]
    });
  });

  afterAll(() => {
    if (originalUseMcp === undefined) {
      delete process.env.USE_MCP_NUTRITION;
    } else {
      process.env.USE_MCP_NUTRITION = originalUseMcp;
    }
  });

  it('uses MCP analysis when MCP call succeeds', async () => {
    const mcpAnalysis = {
      items: [{ item: 'idli', quantity: 2, calories: 116, protein: 4 }],
      totals: { calories: 116, protein: 4 },
      unknownItems: []
    };

    invokeNutritionAnalyzeViaMcp.mockResolvedValue(mcpAnalysis);

    const req = { body: { message: '2 idli' }, user: { _id: 'u1' } };
    const res = mockResponse();

    await aiController.nutritionChat(req, res);

    expect(invokeNutritionAnalyzeViaMcp).toHaveBeenCalledWith('2 idli', expect.any(Object));
    expect(analyzeNutritionText).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        reply: 'Here is your nutrition summary',
        nutritionAnalysis: mcpAnalysis,
        mcpUsed: true,
        analysisSource: 'mcp'
      })
    );
  });

  it('falls back to local deterministic analyzer when MCP call fails', async () => {
    const fallbackAnalysis = {
      items: [{ item: 'egg', quantity: 1, calories: 78, protein: 6.3 }],
      totals: { calories: 78, protein: 6.3 },
      unknownItems: []
    };

    invokeNutritionAnalyzeViaMcp.mockRejectedValue(new Error('MCP unavailable'));
    analyzeNutritionText.mockReturnValue(fallbackAnalysis);

    const req = { body: { message: '1 egg' }, user: { _id: 'u1' } };
    const res = mockResponse();

    await aiController.nutritionChat(req, res);

    expect(invokeNutritionAnalyzeViaMcp).toHaveBeenCalled();
    expect(analyzeNutritionText).toHaveBeenCalledWith('1 egg');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        nutritionAnalysis: fallbackAnalysis,
        mcpUsed: false,
        analysisSource: 'fallback'
      })
    );
  });

  it('uses fallback analyzer directly when MCP is disabled', async () => {
    process.env.USE_MCP_NUTRITION = 'false';

    const fallbackAnalysis = {
      items: [],
      totals: { calories: 0, protein: 0 },
      unknownItems: ['mystery food']
    };
    analyzeNutritionText.mockReturnValue(fallbackAnalysis);

    const req = { body: { message: 'mystery food' }, user: { _id: 'u1' } };
    const res = mockResponse();

    await aiController.nutritionChat(req, res);

    expect(invokeNutritionAnalyzeViaMcp).not.toHaveBeenCalled();
    expect(analyzeNutritionText).toHaveBeenCalledWith('mystery food');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        nutritionAnalysis: fallbackAnalysis,
        mcpUsed: false,
        analysisSource: 'fallback'
      })
    );
  });

  it('returns 400 for empty message', async () => {
    const req = { body: { message: '   ' }, user: { _id: 'u1' } };
    const res = mockResponse();

    await aiController.nutritionChat(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'message is required and must be a non-empty string'
    });
    expect(invokeNutritionAnalyzeViaMcp).not.toHaveBeenCalled();
    expect(analyzeNutritionText).not.toHaveBeenCalled();
  });
});
