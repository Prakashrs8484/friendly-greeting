const foodDatabase = require('../data/foodDatabase');
const { parseNutritionText } = require('../parser/nutrition.parser');
const { calculateNutrition } = require('./nutritionCalculator.service');

function analyzeNutritionText(text) {
  const { items: parsedItems, unknownItems: parserUnknownItems } = parseNutritionText(text, foodDatabase);
  const calculated = calculateNutrition(parsedItems, foodDatabase);

  // Merge parser and calculator unknowns, removing duplicates by item + sourceText.
  const unknownItemMap = new Map();
  [...parserUnknownItems, ...calculated.unknownItems].forEach((entry) => {
    const key = `${entry.item}|${entry.sourceText || ''}`;
    if (!unknownItemMap.has(key)) {
      unknownItemMap.set(key, entry);
    }
  });

  return {
    items: calculated.items,
    unknownItems: Array.from(unknownItemMap.values()),
    totals: calculated.totals
  };
}

module.exports = {
  analyzeNutritionText
};
