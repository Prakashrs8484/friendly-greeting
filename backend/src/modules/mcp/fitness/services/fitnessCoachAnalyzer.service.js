/**
 * Fitness MCP Coach Analyzer Service
 * Generates superficial, consistent coach responses based on parsed fitness actions
 * This service standardizes all fitness coach responses through MCP
 */

const coachResponses = {
  meal: {
    positive: [
      "Good choice on {food}! Nourishing your body well 🥗",
      "{food} is a solid addition to your day 💪",
      "Keep fueling up with {food}!",
      "{food} logged - staying on track! ✅"
    ],
    progress: [
      "You're {percentage}% toward your calorie goal",
      "Protein intake is looking good at {current}g/{goal}g 📊",
      "Keep it up - {percentage}% of daily calories covered"
    ]
  },
  
  workout: {
    positive: [
      "Nice {duration}min {type} session! 🏋️",
      "{duration} minutes of {type} - solid work! 💪",
      "Great effort on that {type} 🔥",
      "{type} for {duration}min - keep going!"
    ],
    time: [
      "You've completed {percentage}% of your workout goal",
      "That's {current}min/{goal}min of your daily target 📈",
      "Workout progress: {percentage}% complete"
    ]
  },

  sleep: {
    positive: [
      "Got {duration}h of sleep - recovery matters! 😴",
      "{duration} hours sleep - nice recovery 💤",
      "Sleep logged: {duration}h ✅",
      "That's {duration}h of quality rest"
    ],
    progress: [
      "Sleep at {current}h/{goal}h for your goal 📊",
      "You're {percentage}% of your sleep target 🛌"
    ]
  },

  hydration: {
    positive: [
      "Drank {volume}L - staying hydrated! 💧",
      "{volume}L of water down - great job",
      "Hydration logged: {volume}L 💦",
      "That's {volume}L keeping you fresh!"
    ],
    progress: [
      "Water intake: {current}L/{goal}L ({percentage}%)",
      "You're {percentage}% of your hydration goal 📊"
    ]
  },

  activity: {
    positive: [
      "{steps} steps logged! Keep moving 🚶",
      "Great activity: {duration}min of {type} 🎯",
      "{steps} steps - movement is medicine 💨",
      "Activity tracked: {duration}min {type} ✅"
    ]
  },

  recovery: {
    positive: [
      "Recovery score: {score}/10 - noted 💪",
      "{score}/10 recovery - taking notes for next time 📝",
      "Recovery status logged at {score}/10 ✅"
    ]
  },

  offline: [
    "I didn't catch that. Try: 'Had 2 dosa for breakfast' or 'Did 30 min yoga' 💪",
    "Can you be more specific? Share meals, workouts, sleep, or water intake.",
    "Let me know what you logged - meals, exercise, sleep, water, or activity!"
  ]
};

/**
 * Generate a superficial coach response based on parsed actions
 * @param {array} parsedActions - Parsed fitness actions
 * @param {object} dashboard - Dashboard with progress data
 * @returns {string} Simple, encouraging coach response
 */
function generateCoachReply(parsedActions, dashboard) {
  if (!parsedActions || parsedActions.length === 0) {
    const responses = coachResponses.offline;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  const responses = [];
  
  // Generate response for each action type
  parsedActions.forEach((action) => {
    const response = buildActionResponse(action, dashboard);
    if (response) {
      responses.push(response);
    }
  });

  // If no responses generated, return generic message
  if (responses.length === 0) {
    return "Logged your activity! Keep it up 💪";
  }

  // Combine 1-2 responses randomly for superficial but encouraging feel
  const selectedCount = Math.min(2, responses.length);
  const selected = [];
  for (let i = 0; i < selectedCount; i++) {
    const idx = Math.floor(Math.random() * responses.length);
    selected.push(responses[idx]);
    responses.splice(idx, 1); // Remove to avoid duplicates
  }

  return selected.join(' ');
}

/**
 * Build a response for a single action
 */
function buildActionResponse(action, dashboard) {
  const { actionType, extractedData = {} } = action;
  const templates = coachResponses[actionType];
  
  if (!templates) return null;

  let template = templates.positive[Math.floor(Math.random() * templates.positive.length)];
  let response = template;

  // Fill in variables based on action type
  switch (actionType) {
    case 'meal': {
      const food = extractedData.food || 'meal';
      response = response.replace('{food}', food);
      
      // Add progress if available
      const progress = (dashboard.progressTowardGoals || {}).calorieConsumption;
      if (progress && templates.progress) {
        const progressMsg = templates.progress[Math.floor(Math.random() * templates.progress.length)];
        const progressStr = progressMsg
          .replace('{percentage}', Math.round(progress.percentage))
          .replace('{current}', Math.round(progress.current))
          .replace('{goal}', Math.round(progress.goal));
        response += ` ${progressStr}`;
      }
      break;
    }

    case 'workout': {
      const duration = extractedData.duration || '30';
      const type = extractedData.type || 'workout';
      response = response.replace('{duration}', duration).replace('{type}', type);
      
      // Add progress if available
      const progress = (dashboard.progressTowardGoals || {}).workout;
      if (progress && templates.time) {
        const progressMsg = templates.time[Math.floor(Math.random() * templates.time.length)];
        const progressStr = progressMsg
          .replace('{percentage}', Math.round(progress.percentage))
          .replace('{current}', Math.round(progress.current))
          .replace('{goal}', Math.round(progress.goal));
        response += ` ${progressStr}`;
      }
      break;
    }

    case 'sleep': {
      const duration = extractedData.duration || '7';
      response = response.replace('{duration}', duration);
      
      // Add progress if available
      const progress = (dashboard.progressTowardGoals || {}).sleep;
      if (progress && templates.progress) {
        const progressMsg = templates.progress[Math.floor(Math.random() * templates.progress.length)];
        const progressStr = progressMsg
          .replace('{percentage}', Math.round(progress.percentage))
          .replace('{current}', Math.round(progress.current))
          .replace('{goal}', Math.round(progress.goal));
        response += ` ${progressStr}`;
      }
      break;
    }

    case 'hydration': {
      const volume = ((extractedData.volumeMl || 500) / 1000).toFixed(1);
      response = response.replace('{volume}', volume);
      
      // Add progress if available
      const progress = (dashboard.progressTowardGoals || {}).water;
      if (progress && templates.progress) {
        const progressMsg = templates.progress[Math.floor(Math.random() * templates.progress.length)];
        const currentLiters = (progress.current / 1000).toFixed(1);
        const goalLiters = (progress.goal / 1000).toFixed(1);
        const progressStr = progressMsg
          .replace('{percentage}', Math.round(progress.percentage))
          .replace('{current}', currentLiters)
          .replace('{goal}', goalLiters);
        response += ` ${progressStr}`;
      }
      break;
    }

    case 'activity': {
      const steps = extractedData.steps;
      const duration = extractedData.duration;
      const type = extractedData.activityType || 'activity';
      
      if (steps) {
        response = response.replace('{steps}', steps);
      } else {
        response = response.replace('{duration}', duration).replace('{type}', type);
      }
      break;
    }

    case 'recovery': {
      const score = extractedData.recoveryQuality || '7';
      response = response.replace('{score}', score);
      break;
    }
  }

  return response;
}

/**
 * Analyze fitness text and generate coach response
 * @param {string} text - Raw user input text
 * @param {array} parsedActions - Pre-parsed actions from parser
 * @param {object} dashboard - Current dashboard state
 * @returns {object} Analysis result with coach message
 */
function analyzeFitnessText(text, parsedActions, dashboard) {
  const coachMessage = generateCoachReply(parsedActions, dashboard);
  
  return {
    text,
    actionCount: (parsedActions || []).length,
    actions: (parsedActions || []).map(a => a.actionType),
    coachMessage,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  generateCoachReply,
  analyzeFitnessText
};
