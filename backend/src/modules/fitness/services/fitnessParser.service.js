function getGroqClient() {
  try {
    return require('../../system/services/groq.service');
  } catch (error) {
    return null;
  }
}

const fitnessParserService = {
  /**
   * Parse natural language text into structured fitness actions
   * Uses rule-based patterns first, falls back to LLM for complex cases
   * @param {string} text - Raw user input
   * @param {object} userProfile - User's fitness profile (for context)
   * @param {string} dateKey - Date in 'YYYY-MM-DD' format
   * @returns {array} Array of parsed actions with confidence scores
   */
  async parseTextInput(text, userProfile, dateKey) {
    if (!text || text.trim().length === 0) {
      return [];
    }

    const lowerText = text.toLowerCase();
    const parsedActions = [];
    const flags = {
      requiresManualReview: false,
      ambiguities: [],
      fallbackUsed: false,
    };

    // Try rule-based extraction first
    const mealAction = this.extractMealData(lowerText);
    if (mealAction) {
      parsedActions.push({
        actionType: 'meal',
        extractedData: mealAction,
        confidence: mealAction.confidence || 0.9,
        source: 'rule',
      });
    }

    const workoutAction = this.extractWorkoutData(lowerText);
    if (workoutAction) {
      parsedActions.push({
        actionType: 'workout',
        extractedData: workoutAction,
        confidence: workoutAction.confidence || 0.9,
        source: 'rule',
      });
    }

    const sleepAction = this.extractSleepData(lowerText);
    if (sleepAction) {
      parsedActions.push({
        actionType: 'sleep',
        extractedData: sleepAction,
        confidence: sleepAction.confidence || 0.9,
        source: 'rule',
      });
    }

    const hydrationAction = this.extractHydrationData(lowerText);
    if (hydrationAction) {
      parsedActions.push({
        actionType: 'hydration',
        extractedData: hydrationAction,
        confidence: hydrationAction.confidence || 0.9,
        source: 'rule',
      });
    }

    const activityAction = this.extractActivityData(lowerText);
    if (activityAction) {
      parsedActions.push({
        actionType: 'activity',
        extractedData: activityAction,
        confidence: activityAction.confidence || 0.9,
        source: 'rule',
      });
    }

    const recoveryAction = this.extractRecoveryData(lowerText);
    if (recoveryAction) {
      parsedActions.push({
        actionType: 'recovery',
        extractedData: recoveryAction,
        confidence: recoveryAction.confidence || 0.9,
        source: 'rule',
      });
    }

    // If no rule-based actions found, try LLM parsing
    if (parsedActions.length === 0) {
      const llmActions = await this.parseWithLLM(text, userProfile);
      if (llmActions && llmActions.length > 0) {
        parsedActions.push(...llmActions);
        flags.fallbackUsed = true;
      }
    }

    // Check for low confidence actions that need review
    const lowConfidenceActions = parsedActions.filter((a) => a.confidence < 0.6);
    if (lowConfidenceActions.length > 0) {
      flags.requiresManualReview = true;
      flags.ambiguities = lowConfidenceActions.map((a) => `${a.actionType}: low confidence`);
    }

    return { actions: parsedActions, flags };
  },

  /**
   * Extract meal data from text using rule-based patterns
   * Examples: "Had 2 dosa", "ate breakfast", "Coffee (300 cal)"
   */
  extractMealData(lowerText) {
    // Pattern: quantity + food item
    const quantityFoodMatch = lowerText.match(/(\d+(?:\.\d+)?)\s+([a-z\s]+?)(?:\s+for|\s+,|$|and|with)/i);
    if (!quantityFoodMatch) {
      // Try just food words
      const foodPatterns = ['had', 'ate', 'eaten', 'breakfast', 'lunch', 'dinner', 'snack', 'coffee', 'tea'];
      const hasFood = foodPatterns.some((p) => lowerText.includes(p));
      if (!hasFood) return null;
    }

    // Extract calories
    const calorieMatch = lowerText.match(/(\d+)\s*(?:cal|calories|kcal)/);
    const calories = calorieMatch ? parseInt(calorieMatch[1]) : null;

    // Extract protein
    const proteinMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:g|gram|grams)?\s*(?:protein)/);
    const protein = proteinMatch ? parseFloat(proteinMatch[1]) : null;

    if (!quantityFoodMatch && !calories && !protein) return null;

    const quantity = quantityFoodMatch ? parseInt(quantityFoodMatch[1]) : null;
    const food = quantityFoodMatch ? quantityFoodMatch[2].trim() : 'meal';

    return {
      food,
      quantity,
      calories,
      protein,
      description: `${quantity ? quantity + ' ' : ''}${food}`,
      confidence: 0.95,
    };
  },

  /**
   * Extract workout data from text
   * Examples: "30 min running", "45-minute yoga", "20 mins workout"
   */
  extractWorkoutData(lowerText) {
    // Pattern: duration + workout type
    const durationMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes|hour|hours|hr|hrs)/);
    if (!durationMatch) return null;

    let duration = parseFloat(durationMatch[1]);
    // Convert hours to minutes if needed
    if (lowerText.includes('hour') || lowerText.includes('hr')) {
      duration = duration * 60;
    }

    // Extract workout type
    const workoutTypes = [
      'running',
      'yoga',
      'cycling',
      'swimming',
      'gym',
      'strength',
      'cardio',
      'walking',
      'hiking',
      'boxing',
      'pilates',
      'dance',
      'workout',
      'exercise',
    ];
    let workoutType = 'workout';
    for (const type of workoutTypes) {
      if (lowerText.includes(type)) {
        workoutType = type;
        break;
      }
    }

    // Extract intensity if mentioned
    const intensityMatch = lowerText.match(/(light|moderate|medium|high|intense|hard|easy)/);
    const intensity = intensityMatch ? intensityMatch[1] : null;

    // Extract calories burned if mentioned
    const caloriesMatch = lowerText.match(/(\d+)\s*(?:cal|calories|kcal)\s*(?:burned|burnt|burn)/);
    const caloriesBurned = caloriesMatch ? parseInt(caloriesMatch[1]) : null;

    return {
      type: workoutType,
      duration,
      intensity,
      caloriesBurned,
      confidence: 0.9,
    };
  },

  /**
   * Extract sleep data from text
   * Examples: "slept 7.5 hours", "8 hours sleep", "6h sleep"
   */
  extractSleepData(lowerText) {
    // Pattern: duration + sleep keywords
    const durationMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:hour|hr|h)\s*(?:sleep|slept)?/);
    if (!durationMatch) return null;

    const duration = parseFloat(durationMatch[1]);

    // Extract quality if mentioned (1-10 rating)
    const qualityMatch = lowerText.match(/quality\s*(?::|=)?\s*(\d+)|feeling\s*(great|good|bad|poor)/i);
    let quality = null;
    if (qualityMatch && qualityMatch[1]) {
      quality = Math.min(10, Math.max(1, parseInt(qualityMatch[1])));
    } else if (qualityMatch && qualityMatch[2]) {
      const feelingMap = { great: 9, good: 7, bad: 3, poor: 2 };
      quality = feelingMap[qualityMatch[2].toLowerCase()] || null;
    }

    return {
      duration,
      sleepQuality: quality,
      confidence: 0.95,
    };
  },

  /**
   * Extract hydration data from text
   * Examples: "drank 2 glasses water", "2L water", "1500ml"
   */
  extractHydrationData(lowerText) {
    // Pattern 1: liters
    const literMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*l(?:iter)?s?\s*(?:water)?/i);
    if (literMatch) {
      const volumeMl = parseFloat(literMatch[1]) * 1000;
      return { volumeMl, confidence: 0.95 };
    }

    // Pattern 2: milliliters
    const mlMatch = lowerText.match(/(\d+)\s*ml\s*(?:water)?/i);
    if (mlMatch) {
      const volumeMl = parseInt(mlMatch[1]);
      return { volumeMl, confidence: 0.95 };
    }

    // Pattern 3: glasses (assume 250ml per glass)
    const glassMatch = lowerText.match(/(\d+)\s*(?:glass|glasses)\s*(?:water)?/i);
    if (glassMatch) {
      const volumeMl = parseInt(glassMatch[1]) * 250;
      return { volumeMl, confidence: 0.9 };
    }

    // Pattern 4: cups (assume 240ml per cup)
    const cupMatch = lowerText.match(/(\d+)\s*(?:cup|cups)\s*(?:water)?/i);
    if (cupMatch) {
      const volumeMl = parseInt(cupMatch[1]) * 240;
      return { volumeMl, confidence: 0.85 };
    }

    return null;
  },

  /**
   * Extract activity data from text
   * Examples: "walked 5000 steps", "took 8k steps"
   */
  extractActivityData(lowerText) {
    // Pattern: steps
    const stepsMatch = lowerText.match(/(\d+(?:k|K)?)\s*(?:step|steps)/);
    if (stepsMatch) {
      let steps = parseInt(stepsMatch[1]);
      if (stepsMatch[1].toLowerCase().includes('k')) {
        steps = steps * 1000;
      }
      return { steps, confidence: 0.95 };
    }

    // Pattern: duration + activity type (walking, jogging, etc.)
    const durationMatch = lowerText.match(/(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes)/);
    if (durationMatch) {
      const duration = parseFloat(durationMatch[1]);
      const activityTypes = ['walk', 'jog', 'run', 'cycle', 'hike'];
      let activityType = 'activity';
      for (const type of activityTypes) {
        if (lowerText.includes(type)) {
          activityType = type;
          break;
        }
      }
      return { duration, activityType, confidence: 0.85 };
    }

    return null;
  },

  /**
   * Extract recovery data from text
   * Examples: "recovery score 8", "feeling good recovery"
   */
  extractRecoveryData(lowerText) {
    // Pattern: recovery score
    const scoreMatch = lowerText.match(/recovery\s*(?:score|rating)?\s*(?::|=)?\s*(\d+)/i);
    if (scoreMatch) {
      const quality = Math.min(10, Math.max(1, parseInt(scoreMatch[1])));
      return { recoveryQuality: quality, confidence: 0.95 };
    }

    // Pattern: feeling + quality adjective
    const feelingMatch = lowerText.match(/(?:feeling|feel)\s*(great|good|okay|bad|poor)/i);
    if (feelingMatch) {
      const feelingMap = { great: 9, good: 7, okay: 5, bad: 3, poor: 2 };
      const quality = feelingMap[feelingMatch[1].toLowerCase()];
      return { recoveryQuality: quality, confidence: 0.8 };
    }

    return null;
  },

  /**
   * LLM-based fallback parser for complex/ambiguous text
   * Uses Groq with temperature 0.3 for precise extraction
   */
  async parseWithLLM(text, userProfile) {
    try {
      if (!process.env.GROQ_API_KEY) {
        return [];
      }

      const groq = getGroqClient();
      if (!groq) {
        return [];
      }

      const prompt = `Extract fitness activities from this user input and return structured JSON.
User input: "${text}"

Return ONLY a JSON array (no markdown, no explanation). If no activities found, return [].
Each activity should be one of: meal, workout, sleep, hydration, activity, recovery.

Example output format:
[
  {"actionType": "meal", "extractedData": {"food": "dosa", "quantity": 2, "calories": 600}},
  {"actionType": "workout", "extractedData": {"type": "yoga", "duration": 30}}
]

Possible fields for extractedData:
- meal: food, quantity, calories, protein, description
- workout: type, duration, intensity, caloriesBurned
- sleep: duration, sleepQuality
- hydration: volumeMl
- activity: activityType, steps, duration
- recovery: recoveryQuality

Rules:
- Keep confidence 0.6-0.9 if some fields are guessed
- Mark actionType clearly
- Only include extractedData fields you can extract`;

      const response = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });

      const content = response.choices[0].message.content.trim();

      // Try to parse JSON
      let parsed = JSON.parse(content);
      if (!Array.isArray(parsed)) {
        parsed = [parsed];
      }

      // Add source and confidence
      return parsed.map((action) => ({
        ...action,
        source: 'llm',
        confidence: action.confidence || 0.65,
      }));
    } catch (error) {
      console.error('LLM parsing error:', error.message);
      return [];
    }
  },
};

module.exports = fitnessParserService;
