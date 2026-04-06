const { parseNutritionText } = require('../src/modules/mcp/nutrition/parser/nutrition.parser');
const foodDatabase = require('../src/modules/mcp/nutrition/data/foodDatabase');
const { analyzeNutritionText } = require('../src/modules/mcp/nutrition/services/nutritionAnalyzer.service');

describe('MCP Nutrition - parser and deterministic calculator', () => {
  it('parses known foods with quantity from natural language', () => {
    const result = parseNutritionText('3 idli and 1 scoop whey', foodDatabase);

    expect(result.items).toEqual([
      expect.objectContaining({ item: 'idli', quantity: 3 }),
      expect.objectContaining({ item: 'whey', quantity: 1, unit: 'scoop' })
    ]);
  });

  it('handles plural forms and optional units', () => {
    const result = parseNutritionText('2 eggs and 1 cup rice', foodDatabase);

    expect(result.items).toEqual([
      expect.objectContaining({ item: 'egg', quantity: 2 }),
      expect.objectContaining({ item: 'rice', quantity: 1, unit: 'cup' })
    ]);
  });

  it('flags unknown items and excludes them from totals', () => {
    const result = analyzeNutritionText('2 idli and 1 dragonfruit shake');

    expect(result.items).toEqual([
      expect.objectContaining({ item: 'idli', quantity: 2, calories: 116, protein: 4 })
    ]);
    expect(result.unknownItems.length).toBeGreaterThan(0);
    expect(result.totals).toEqual({ calories: 116, protein: 4 });
  });

  it('returns deterministic totals for the same input', () => {
    const input = '3 idli and 1 scoop whey';

    const first = analyzeNutritionText(input);
    const second = analyzeNutritionText(input);

    expect(first).toEqual(second);
    expect(first.totals).toEqual({ calories: 294, protein: 30 });
  });
});
