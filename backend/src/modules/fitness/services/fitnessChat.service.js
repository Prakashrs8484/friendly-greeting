function getGroqClient() {
  try {
    return require('../../system/services/groq.service');
  } catch (error) {
    return null;
  }
}

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
  { canonical: 'workout', variants: ['workout', 'exercise', 'training', 'gym'] },
  { canonical: 'hiking', variants: ['hike', 'hiking'] },
];

function normalizeText(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}

function normalizeUnit(value, fallback = 'serving') {
  const token = normalizeText(value).toLowerCase();
  if (!token) return fallback;

  const aliases = {
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

  return aliases[token] || token;
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

  try {
    return JSON.parse(content);
  } catch (error) {
    const firstBrace = content.indexOf('{');
    const lastBrace = content.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('Chat model did not return JSON');
    }

    return JSON.parse(content.slice(firstBrace, lastBrace + 1));
  }
}

function normalizeMealFood(rawFood) {
  return normalizeText(rawFood)
    .replace(/\b(for breakfast|for lunch|for dinner|for snack)\b/gi, '')
    .replace(/^[\s,-]+|[\s,-]+$/g, '')
    .trim();
}

function normalizeEvent(event) {
  if (!event || typeof event !== 'object') return null;

  const type = normalizeText(event.type).toLowerCase();
  if (type === 'meal_log') {
    const food = normalizeMealFood(event.food || event.item);
    const quantity = parseNumberish(event.quantity, 1);
    const unit = normalizeUnit(event.unit, 'serving');

    if (!food || !quantity || quantity <= 0) return null;
    return {
      type: 'meal_log',
      food,
      quantity,
      unit,
    };
  }

  if (type === 'activity_log') {
    const activity = normalizeText(event.activity || event.food).toLowerCase();
    const duration = parseNumberish(event.duration ?? event.quantity, null);
    const unit = normalizeUnit(event.unit, 'minutes');

    if (!activity || !duration || duration <= 0) return null;
    return {
      type: 'activity_log',
      activity,
      duration,
      unit,
    };
  }

  return null;
}

function extractActivityRule(text) {
  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();
  const alias = ACTIVITY_ALIASES.find((item) =>
    item.variants.some((variant) => lower.includes(variant))
  );

  if (!alias) return null;

  const durationMatch = lower.match(
    /(\d+(?:\.\d+)?)\s*(minutes?|mins?|minute|hours?|hrs?|hr|hour)\b/
  );
  if (!durationMatch) return null;

  const duration = parseNumberish(durationMatch[1], null);
  const unit = normalizeUnit(durationMatch[2], 'minutes');
  if (!duration || duration <= 0) return null;

  return {
    type: 'activity_log',
    activity: alias.canonical,
    duration,
    unit,
  };
}

function extractMealRule(text) {
  const normalized = normalizeText(text);
  const lower = normalized.toLowerCase();
  const hasMealIntent =
    /\b(ate|had|consumed|drank|meal|breakfast|lunch|dinner|snack)\b/.test(lower) &&
    !/\b(walk|run|cycle|swim|workout|exercise|training|yoga)\b/.test(lower);

  if (!hasMealIntent) return null;

  const source =
    normalized.match(/(?:ate|had|consumed|drank)\s+(.+)/i)?.[1] ||
    normalized.match(/(?:breakfast|lunch|dinner|snack)\s*[:\-]?\s*(.+)/i)?.[1] ||
    normalized;

  const cleanSource = normalizeMealFood(source);
  if (!cleanSource) return null;

  const match = cleanSource.match(
    /^(\d+(?:\.\d+)?|a|an|one|two|three|four|five|six|seven|eight|nine|ten|half)?\s*(bowl|bowls|cup|cups|plate|plates|serving|servings|piece|pieces|slice|slices|glass|glasses|scoop|scoops)?\s*(?:of)?\s*(.+)$/i
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

function fallbackChatResponse(events) {
  if (!events.length) {
    return "Got it. I can keep chatting and also log meals or activities whenever you mention them.";
  }

  const summary = events
    .map((event) => {
      if (event.type === 'meal_log') {
        return `${event.quantity} ${event.unit} ${event.food}`;
      }
      return `${event.activity} for ${event.duration} ${event.unit}`;
    })
    .join(', ');

  return `Logged: ${summary}. Keep going, and tell me your next meal or activity when you're ready.`;
}

const fitnessChatService = {
  async generateChatAndEvents({ text, contextSummary = '' }) {
    if (!text || !text.trim()) {
      return {
        chatResponse: "Please share what you ate or what activity you did.",
        events: [],
      };
    }

    if (!process.env.GROQ_API_KEY) {
      const events = [extractMealRule(text), extractActivityRule(text)].filter(Boolean);
      return {
        chatResponse: fallbackChatResponse(events),
        events,
      };
    }

    const groq = getGroqClient();
    if (!groq) {
      const events = [extractMealRule(text), extractActivityRule(text)].filter(Boolean);
      return {
        chatResponse: fallbackChatResponse(events),
        events,
      };
    }

    try {
      const prompt = `You are a fitness assistant. Return strict JSON only.

User message:
"${text}"

Context:
${contextSummary || 'No additional context'}

Return exactly this shape:
{
  "chatResponse": "Natural conversational reply to the user",
  "events": [
    {
      "type": "meal_log",
      "food": "rice",
      "quantity": 1,
      "unit": "bowl"
    },
    {
      "type": "activity_log",
      "food": "walking",
      "quantity": 30,
      "unit": "minutes"
    }
  ]
}

Rules:
- Keep chatResponse natural and concise (1-3 sentences).
- events must contain only trackable meal/activity events from the user message.
- If no trackable event exists, return "events": [].
- For meal_log include: type, food, quantity, unit.
- For activity_log include: type, food, quantity, unit (or activity/duration; both are accepted).
- Do not include markdown or extra keys.`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You must output valid JSON only. No prose outside JSON. No markdown.',
          },
          { role: 'user', content: prompt },
        ],
      });

      const content = completion?.choices?.[0]?.message?.content || '';
      const payload = extractJsonObject(content);
      const chatResponse = normalizeText(payload.chatResponse);
      const events = Array.isArray(payload.events) ? payload.events.map(normalizeEvent).filter(Boolean) : [];

      return {
        chatResponse:
          chatResponse || fallbackChatResponse(events),
        events,
      };
    } catch (error) {
      console.error('fitnessChatService model parse failure:', error.message);
      const events = [extractMealRule(text), extractActivityRule(text)].filter(Boolean);
      return {
        chatResponse: fallbackChatResponse(events),
        events,
      };
    }
  },
};

module.exports = fitnessChatService;
