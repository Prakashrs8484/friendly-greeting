const FOOD_NUTRITION_PER_UNIT = {
  rice: {
    bowl: { calories: 220, protein: 4.3, carbs: 48, fats: 0.4 },
    cup: { calories: 206, protein: 4.3, carbs: 45, fats: 0.4 },
    plate: { calories: 300, protein: 6, carbs: 65, fats: 0.6 },
    serving: { calories: 220, protein: 4.3, carbs: 48, fats: 0.4 },
  },
  roti: {
    piece: { calories: 110, protein: 3.2, carbs: 18.5, fats: 2.4 },
    serving: { calories: 110, protein: 3.2, carbs: 18.5, fats: 2.4 },
  },
  chapati: {
    piece: { calories: 110, protein: 3.2, carbs: 18.5, fats: 2.4 },
    serving: { calories: 110, protein: 3.2, carbs: 18.5, fats: 2.4 },
  },
  dosa: {
    piece: { calories: 170, protein: 4.2, carbs: 28, fats: 5.5 },
    serving: { calories: 170, protein: 4.2, carbs: 28, fats: 5.5 },
  },
  idli: {
    piece: { calories: 60, protein: 2, carbs: 12, fats: 0.2 },
    serving: { calories: 60, protein: 2, carbs: 12, fats: 0.2 },
  },
  oats: {
    bowl: { calories: 180, protein: 6.2, carbs: 30, fats: 3.2 },
    cup: { calories: 150, protein: 5.2, carbs: 27, fats: 2.8 },
    serving: { calories: 180, protein: 6.2, carbs: 30, fats: 3.2 },
  },
  banana: {
    piece: { calories: 105, protein: 1.3, carbs: 27, fats: 0.3 },
    serving: { calories: 105, protein: 1.3, carbs: 27, fats: 0.3 },
  },
  egg: {
    piece: { calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3 },
    serving: { calories: 78, protein: 6.3, carbs: 0.6, fats: 5.3 },
  },
  whey: {
    scoop: { calories: 120, protein: 24, carbs: 3, fats: 2 },
    serving: { calories: 120, protein: 24, carbs: 3, fats: 2 },
  },
  chicken: {
    serving: { calories: 250, protein: 30, carbs: 0, fats: 14 },
    bowl: { calories: 300, protein: 34, carbs: 2, fats: 17 },
  },
  salad: {
    bowl: { calories: 120, protein: 4, carbs: 12, fats: 6 },
    serving: { calories: 120, protein: 4, carbs: 12, fats: 6 },
  },
  bread: {
    slice: { calories: 80, protein: 2.6, carbs: 14, fats: 1.1 },
    serving: { calories: 80, protein: 2.6, carbs: 14, fats: 1.1 },
  },
  milk: {
    glass: { calories: 150, protein: 8, carbs: 12, fats: 8 },
    cup: { calories: 120, protein: 6.5, carbs: 9.5, fats: 6.5 },
    serving: { calories: 150, protein: 8, carbs: 12, fats: 8 },
  },
  coffee: {
    cup: { calories: 80, protein: 3, carbs: 10, fats: 3 },
    glass: { calories: 100, protein: 4, carbs: 12, fats: 4 },
    serving: { calories: 80, protein: 3, carbs: 10, fats: 3 },
  },
  tea: {
    cup: { calories: 60, protein: 1.5, carbs: 8, fats: 2 },
    glass: { calories: 80, protein: 2, carbs: 11, fats: 2.5 },
    serving: { calories: 60, protein: 1.5, carbs: 8, fats: 2 },
  },
  apple: {
    piece: { calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
    serving: { calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
  },
  dal: {
    bowl: { calories: 190, protein: 10, carbs: 28, fats: 4.5 },
    cup: { calories: 180, protein: 9, carbs: 26, fats: 4.2 },
    serving: { calories: 190, protein: 10, carbs: 28, fats: 4.5 },
  },
  yogurt: {
    cup: { calories: 150, protein: 8, carbs: 12, fats: 7 },
    bowl: { calories: 170, protein: 9, carbs: 14, fats: 8 },
    serving: { calories: 150, protein: 8, carbs: 12, fats: 7 },
  },
  curd: {
    cup: { calories: 150, protein: 8, carbs: 12, fats: 7 },
    bowl: { calories: 170, protein: 9, carbs: 14, fats: 8 },
    serving: { calories: 150, protein: 8, carbs: 12, fats: 7 },
  },
  paneer: {
    serving: { calories: 265, protein: 18, carbs: 4, fats: 20 },
    bowl: { calories: 300, protein: 21, carbs: 5, fats: 23 },
  },
};

const ACTIVITY_CALORIES_PER_MIN = {
  walking: 4.2,
  walk: 4.2,
  running: 10.5,
  run: 10.5,
  jogging: 8.0,
  jog: 8.0,
  cycling: 7.5,
  cycle: 7.5,
  swimming: 9.0,
  swim: 9.0,
  yoga: 3.5,
  workout: 6.0,
  exercise: 6.0,
  strength: 6.5,
  gym: 6.5,
  hike: 7.0,
  hiking: 7.0,
};

const DEFAULT_MEAL_NUTRITION_PER_SERVING = {
  calories: 250,
  protein: 10,
  carbs: 28,
  fats: 8,
};
const DEFAULT_ACTIVITY_CALORIES_PER_MIN = 5.0;

function normalizeToken(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

function findFoodKey(foodName) {
  const token = normalizeToken(foodName);
  if (!token) return null;

  if (FOOD_NUTRITION_PER_UNIT[token]) {
    return token;
  }

  const exactAlias = Object.keys(FOOD_NUTRITION_PER_UNIT).find((key) =>
    token.includes(key) || key.includes(token)
  );

  return exactAlias || null;
}

function findFoodNutrition(foodName, unit) {
  const key = findFoodKey(foodName);
  const normalizedUnit = normalizeToken(unit) || 'serving';

  if (!key) {
    return {
      key: null,
      perUnit: DEFAULT_MEAL_NUTRITION_PER_SERVING,
      resolvedUnit: normalizedUnit || 'serving',
    };
  }

  const unitMap = FOOD_NUTRITION_PER_UNIT[key];

  const perUnit =
    unitMap[normalizedUnit] ||
    unitMap.serving ||
    Object.values(unitMap)[0] ||
    DEFAULT_MEAL_NUTRITION_PER_SERVING;

  return {
    key,
    perUnit,
    resolvedUnit: unitMap[normalizedUnit] ? normalizedUnit : 'serving',
  };
}

function findFoodCalories(foodName, unit) {
  const nutrition = findFoodNutrition(foodName, unit);
  return {
    key: nutrition.key,
    caloriesPerUnit: nutrition.perUnit.calories,
    resolvedUnit: nutrition.resolvedUnit,
  };
}

function findActivityBurnRate(activityName) {
  const token = normalizeToken(activityName);
  if (!token) {
    return {
      key: null,
      caloriesPerMinute: DEFAULT_ACTIVITY_CALORIES_PER_MIN,
    };
  }

  if (ACTIVITY_CALORIES_PER_MIN[token]) {
    return {
      key: token,
      caloriesPerMinute: ACTIVITY_CALORIES_PER_MIN[token],
    };
  }

  const matchedKey = Object.keys(ACTIVITY_CALORIES_PER_MIN).find((key) =>
    token.includes(key) || key.includes(token)
  );

  return {
    key: matchedKey || null,
    caloriesPerMinute:
      (matchedKey && ACTIVITY_CALORIES_PER_MIN[matchedKey]) || DEFAULT_ACTIVITY_CALORIES_PER_MIN,
  };
}

module.exports = {
  FOOD_NUTRITION_PER_UNIT,
  ACTIVITY_CALORIES_PER_MIN,
  DEFAULT_MEAL_NUTRITION_PER_SERVING,
  DEFAULT_ACTIVITY_CALORIES_PER_MIN,
  findFoodNutrition,
  findFoodCalories,
  findActivityBurnRate,
};
