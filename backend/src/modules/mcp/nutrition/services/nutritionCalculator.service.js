const UNIT_SYNONYM_MAP = {
  cup: 'cup',
  cups: 'cup',
  bowl: 'cup',
  bowls: 'cup',
  scoop: 'scoop',
  scoops: 'scoop',
  serving: 'scoop',
  servings: 'scoop',
  piece: 'piece',
  pieces: 'piece',
  pc: 'piece',
  pcs: 'piece',
  egg: 'piece',
  eggs: 'piece',
  glass: 'glass',
  glasses: 'glass',
  tbsp: 'tbsp',
  tablespoon: 'tbsp',
  tablespoons: 'tbsp'
};

function normalizeUnit(unit) {
  if (!unit) return null;
  return UNIT_SYNONYM_MAP[unit.toLowerCase()] || unit.toLowerCase();
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function buildFoodMap(foodDatabase) {
  return new Map(foodDatabase.map((food) => [food.item, food]));
}

function calculateNutrition(parsedItems, foodDatabase) {
  const foodMap = buildFoodMap(foodDatabase);
  const lineItems = [];
  const unknownItems = [];

  let totalCalories = 0;
  let totalProtein = 0;

  for (const parsed of parsedItems) {
    const food = foodMap.get(parsed.item);

    if (!food) {
      unknownItems.push(parsed);
      continue;
    }

    const quantity = Number(parsed.quantity) || 0;
    const calories = quantity * food.caloriesPerUnit;
    const protein = quantity * food.proteinPerUnit;

    totalCalories += calories;
    totalProtein += protein;

    lineItems.push({
      item: food.item,
      quantity,
      inputUnit: normalizeUnit(parsed.unit),
      unit: food.unit,
      caloriesPerUnit: food.caloriesPerUnit,
      proteinPerUnit: food.proteinPerUnit,
      calories: round2(calories),
      protein: round2(protein)
    });
  }

  return {
    items: lineItems,
    unknownItems,
    totals: {
      calories: round2(totalCalories),
      protein: round2(totalProtein)
    }
  };
}

module.exports = {
  calculateNutrition,
  normalizeUnit
};
