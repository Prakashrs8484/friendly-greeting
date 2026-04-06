const NUMBER_WORDS = {
  a: 1,
  an: 1,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
};

const ACTIVITY_ALIASES = [
  { canonical: 'walking', variants: ['walk', 'walking'] },
  { canonical: 'running', variants: ['run', 'running'] },
  { canonical: 'jogging', variants: ['jog', 'jogging'] },
  { canonical: 'cycling', variants: ['cycle', 'cycling', 'biking'] },
  { canonical: 'swimming', variants: ['swim', 'swimming'] },
  { canonical: 'yoga', variants: ['yoga'] },
  { canonical: 'strength training', variants: ['strength', 'weights', 'weight training'] },
  { canonical: 'workout', variants: ['workout', 'exercise', 'training'] },
  { canonical: 'hiking', variants: ['hike', 'hiking'] },
];

function getGroqClient() {
  try {
    return require('../../system/services/groq.service');
  } catch (error) {
    return null;
  }
}

function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeUnit(value, fallback = 'serving') {
  const token = normalizeText(value).toLowerCase();
  if (!token) return fallback;

  const unitAliases = {
    bowls: 'bowl',
    cups: 'cup',
    plates: 'plate',
    servings: 'serving',
    pieces: 'piece',
    slices: 'slice',
    glasses: 'glass',
    mins: 'minutes',
    min: 'minutes',
    minute: 'minutes',
    hr: 'hours',
    hrs: 'hours',
    hour: 'hours',
  };

  return unitAliases[token] || token;
}

function parseNumberish(rawValue, fallback = null) {
  if (rawValue === undefined || rawValue === null) return fallback;

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    return rawValue;
  }

  const token = String(rawValue).trim().toLowerCase();
  if (!token) return fallback;

  if (NUMBER_WORDS[token] !== undefined) {
    return NUMBER_WORDS[token];
  }

  const numeric = Number(token);
  return Number.isFinite(numeric) ? numeric : fallback;
}

function extractJsonObject(rawContent) {
  const content = normalizeText(rawContent)
    .replace(/^```json/i, '')
    .replace(/^```/i, '')
    .replace(/```$/i, '')
    .trim();

  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Parser did not return JSON');
  }

  const jsonSlice = content.slice(firstBrace, lastBrace + 1);
  return JSON.parse(jsonSlice);
}

function normalizeMealFood(rawFood) {
  return normalizeText(rawFood)
    .replace(/\b(for breakfast|for lunch|for dinner|for snack)\b/gi, '')
    .replace(/^[\s,-]+|[\s,-]+$/g, '')
    .trim();
}

function extractMealCommand(text) {
  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();
  const mealIntent =
    /\b(ate|had|consumed|drank|meal|breakfast|lunch|dinner|snack)\b/.test(lower) &&
    !/\b(walk|run|cycle|swim|workout|exercise|training|yoga)\b/.test(lower);

  if (!mealIntent) return null;

  const source =
    normalized.match(/(?:ate|had|consumed|drank)\s+(.+)/i)?.[1] ||
    normalized.match(/(?:breakfast|lunch|dinner|snack)\s*[:\-]?\s*(.+)/i)?.[1] ||
    normalized;

  const cleanSource = normalizeMealFood(source);
  if (!cleanSource) return null;

  const match = cleanSource.match(
    /^(\d+(?:\.\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten|half)?\s*(bowl|bowls|cup|cups|plate|plates|serving|servings|piece|pieces|slice|slices|glass|glasses)?\s*(?:of)?\s*(.+)$/i
  );

  if (!match) {
    return {
      type: 'meal_log',
      food: cleanSource,
      quantity: 1,
      unit: 'serving',
    };
  }

  const quantity = parseNumberish(match[1], 1);
  const unit = normalizeUnit(match[2], 'serving');
  const food = normalizeMealFood(match[3]);

  if (!food) return null;

  return {
    type: 'meal_log',
    food,
    quantity,
    unit,
  };
}

function extractCanonicalActivity(lowerText) {
  const found = ACTIVITY_ALIASES.find((candidate) =>
    candidate.variants.some((variant) => lowerText.includes(variant))
  );
  return found ? found.canonical : null;
}

function extractActivityCommand(text) {
  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();
  const activity = extractCanonicalActivity(lower);

  if (!activity) return null;

  const durationMatch = lower.match(
    /(\d+(?:\.\d+)?)\s*(minutes?|mins?|minute|hours?|hrs?|hr|hour)\b/
  );

  if (!durationMatch) return null;

  const duration = parseNumberish(durationMatch[1], null);
  const unit = normalizeUnit(durationMatch[2], 'minutes');

  if (!duration || duration <= 0) return null;

  return {
    type: 'activity_log',
    activity,
    duration,
    unit,
  };
}

function validateCommandShape(command) {
  if (!command || typeof command !== 'object') {
    throw new Error('Command parser returned invalid payload');
  }

  if (command.type === 'meal_log') {
    const food = normalizeMealFood(command.food);
    const quantity = parseNumberish(command.quantity, null);
    const unit = normalizeUnit(command.unit, 'serving');

    if (!food) throw new Error('meal_log.food is required');
    if (!quantity || quantity <= 0) throw new Error('meal_log.quantity must be > 0');
    if (!unit) throw new Error('meal_log.unit is required');

    return {
      type: 'meal_log',
      food,
      quantity,
      unit,
    };
  }

  if (command.type === 'activity_log') {
    const activity = normalizeText(command.activity).toLowerCase();
    const duration = parseNumberish(command.duration, null);
    const unit = normalizeUnit(command.unit, 'minutes');

    if (!activity) throw new Error('activity_log.activity is required');
    if (!duration || duration <= 0) throw new Error('activity_log.duration must be > 0');
    if (!unit) throw new Error('activity_log.unit is required');

    return {
      type: 'activity_log',
      activity,
      duration,
      unit,
    };
  }

  throw new Error('Command type must be meal_log or activity_log');
}

const healthCommandParserService = {
  async parseCommand(text) {
    if (!text || !text.trim()) {
      throw new Error('Input text is required');
    }

    const llmCommand = await this.parseWithLLM(text);
    if (llmCommand) {
      return validateCommandShape(llmCommand);
    }

    const ruleCommand = extractMealCommand(text) || extractActivityCommand(text);
    if (ruleCommand) {
      return validateCommandShape(ruleCommand);
    }

    throw new Error(
      'Unable to parse command. Try examples like "I ate one bowl of rice" or "I walked 30 minutes".'
    );
  },

  async parseWithLLM(text) {
    try {
      if (!process.env.GROQ_API_KEY) {
        return null;
      }

      const groq = getGroqClient();
      if (!groq) {
        return null;
      }

      const prompt = `Convert this fitness command to strict JSON.

Input text: "${text}"

Return one JSON object only. No markdown. No explanations.
Allowed schemas:
1) Meal log:
{"type":"meal_log","food":"rice","quantity":1,"unit":"bowl"}

2) Activity log:
{"type":"activity_log","activity":"walking","duration":30,"unit":"minutes"}

Rules:
- Output must be valid JSON.
- type must be exactly "meal_log" or "activity_log".
- quantity and duration must be numbers.
- If uncertain, make the safest reasonable guess from the text.
- Do not include extra keys.`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content:
              'You are a strict parser. Output valid JSON only. Never output prose, markdown, or code fences.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
      });

      const content = response?.choices?.[0]?.message?.content;
      if (!content) return null;

      return extractJsonObject(content);
    } catch (error) {
      console.error('HealthCommandParser LLM parse error:', error.message);
      return null;
    }
  },
};

module.exports = healthCommandParserService;
