const DEFAULT_QUANTITY = 1;
const NUMBER_REGEX = /(\d+(?:\.\d+)?)/;

const UNITS = [
  'cup', 'cups',
  'scoop', 'scoops',
  'piece', 'pieces', 'pc', 'pcs',
  'glass', 'glasses',
  'tbsp', 'tablespoon', 'tablespoons',
  'bowl', 'bowls',
  'egg', 'eggs',
  'serving', 'servings'
];

const STOPWORD_SEGMENTS = new Set([
  'for breakfast', 'for lunch', 'for dinner',
  'today', 'yesterday', 'now', 'later',
  'had', 'ate', 'drink', 'drank', 'with', 'and'
]);

function normalizeText(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getAliasLookup(foodDatabase) {
  const lookup = [];
  for (const food of foodDatabase) {
    for (const alias of food.aliases) {
      lookup.push({ alias, item: food.item });
    }
  }

  // Match longest aliases first (e.g. "masala dosa" before "dosa").
  lookup.sort((a, b) => b.alias.length - a.alias.length);
  return lookup;
}

function extractQuantity(segment) {
  const articleMatch = segment.match(/\b(a|an)\b/);
  const numberMatch = segment.match(NUMBER_REGEX);

  if (numberMatch) {
    return Number(numberMatch[1]);
  }

  if (articleMatch) {
    return 1;
  }

  return DEFAULT_QUANTITY;
}

function extractUnit(segment) {
  const unitRegex = new RegExp(`\\b(${UNITS.map(escapeRegex).join('|')})\\b`, 'i');
  const unitMatch = segment.match(unitRegex);
  return unitMatch ? unitMatch[1].toLowerCase() : null;
}

function cleanUnknownSegment(segment) {
  let cleaned = segment
    .replace(NUMBER_REGEX, ' ')
    .replace(/\b(a|an)\b/g, ' ')
    .replace(new RegExp(`\\b(${UNITS.map(escapeRegex).join('|')})\\b`, 'g'), ' ')
    .replace(/\b(of|with|and)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned || STOPWORD_SEGMENTS.has(cleaned)) {
    return null;
  }

  if (cleaned.length <= 1) {
    return null;
  }

  return cleaned;
}

function parseNutritionText(text, foodDatabase) {
  const normalized = normalizeText(text);
  if (!normalized) {
    return { items: [], unknownItems: [] };
  }

  const aliasLookup = getAliasLookup(foodDatabase);
  const segments = normalized
    .split(/,|\+|\band\b|\bwith\b|&/g)
    .map((segment) => segment.trim())
    .filter(Boolean);

  const items = [];
  const unknownItems = [];

  for (const segment of segments) {
    const quantity = extractQuantity(segment);
    const unit = extractUnit(segment);
    let matched = false;

    for (const entry of aliasLookup) {
      const aliasRegex = new RegExp(`\\b${escapeRegex(entry.alias)}\\b`, 'i');
      if (aliasRegex.test(segment)) {
        items.push({
          item: entry.item,
          quantity,
          unit,
          sourceText: segment
        });
        matched = true;
        break;
      }
    }

    if (!matched) {
      const unknownItem = cleanUnknownSegment(segment);
      const hasNumber = NUMBER_REGEX.test(segment);

      if (unknownItem && hasNumber) {
        unknownItems.push({
          item: unknownItem,
          quantity,
          unit,
          sourceText: segment
        });
      }
    }
  }

  return { items, unknownItems };
}

module.exports = {
  parseNutritionText
};
