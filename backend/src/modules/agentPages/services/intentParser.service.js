/**
 * Intent Parser Service
 * Rule-based parsing to map natural language input to feature templates
 * 
 * CORE CLASSIFICATION RULE:
 * - FUNCTIONAL FEATURE (default): CRUD, tracking, management
 * - CHAT FEATURE: Only when explicitly requested (advice, coaching, guidance)
 * 
 * TODO: Future enhancements:
 * - Advanced intent understanding: Use LLM for complex requirement parsing
 * - Multi-feature detection: Detect when user wants multiple features
 * - Custom feature detection: Identify custom feature requirements
 * - Context awareness: Use conversation history to improve parsing
 */

/**
 * Classify feature as FUNCTIONAL or CHAT
 * @param {string} input - User's natural language description
 * @returns {string} - 'functional' or 'chat'
 */
const classifyFeatureCategory = (input) => {
  const lowerInput = input.toLowerCase();
  
  // CHAT FEATURE indicators (explicit conversational requests)
  const chatKeywords = [
    'advice', 'coach', 'help me decide', 'explain', 'guide', 'mentor',
    'talk to', 'ask questions', 'conversation', 'chat with', 'discuss'
  ];
  
  // FUNCTIONAL FEATURE indicators (CRUD, management, tracking)
  const functionalKeywords = [
    'add', 'remove', 'edit', 'delete', 'track', 'store', 'save', 'list',
    'ideas', 'notes', 'research', 'tasks', 'todos', 'manage', 'organize', 'keep'
  ];
  
  // Check for explicit chat requests first
  for (const keyword of chatKeywords) {
    if (lowerInput.includes(keyword)) {
      return 'chat';
    }
  }
  
  // Check for functional indicators
  for (const keyword of functionalKeywords) {
    if (lowerInput.includes(keyword)) {
      return 'functional';
    }
  }
  
  // Default to functional (not chat)
  return 'functional';
};

/**
 * Parse user input and determine feature type and requirements
 * @param {string} input - User's natural language description
 * @returns {Object} - { type, category, requirements, actions }
 */
const parseIntent = (input) => {
  const lowerInput = input.toLowerCase();
  
  // First classify as functional or chat
  const category = classifyFeatureCategory(input);
  
  // Extract feature type
  let type = null;
  const requirements = {
    actions: [],
    components: [],
    topics: []
  };

  // Detect specific feature types
  if (lowerInput.includes('todo') || lowerInput.includes('task') || lowerInput.includes('checklist')) {
    type = 'todo';
  } else if (lowerInput.includes('note') || lowerInput.includes('memo') || lowerInput.includes('journal')) {
    type = 'notes';
  } else if (lowerInput.includes('idea') || lowerInput.includes('ideas')) {
    type = 'ideas';
  } else if (lowerInput.includes('research') && (lowerInput.includes('track') || lowerInput.includes('keep'))) {
    type = 'research-tracker';
  } else if (category === 'chat' && (lowerInput.includes('advice') || lowerInput.includes('suggestion') || lowerInput.includes('recommendation'))) {
    type = 'advice';
  } else if (lowerInput.includes('track') || lowerInput.includes('habit') || lowerInput.includes('monitor')) {
    type = 'tracker';
  } else if (lowerInput.includes('insight') || lowerInput.includes('analytics') || lowerInput.includes('dashboard')) {
    type = 'insights';
  }

  // Extract actions
  if (lowerInput.includes('add') || lowerInput.includes('create') || lowerInput.includes('new')) {
    requirements.actions.push('add');
  }
  if (lowerInput.includes('edit') || lowerInput.includes('update') || lowerInput.includes('modify')) {
    requirements.actions.push('edit');
  }
  if (lowerInput.includes('delete') || lowerInput.includes('remove')) {
    requirements.actions.push('delete');
  }
  if (lowerInput.includes('insight') || lowerInput.includes('analyze') || lowerInput.includes('suggest')) {
    requirements.actions.push('insights');
  }
  if (lowerInput.includes('summary') || lowerInput.includes('summarize')) {
    requirements.actions.push('summarize');
  }

  // Extract topics/themes
  const topicKeywords = {
    'productivity': 'productivity',
    'wellness': 'wellness',
    'mental': 'mental wellness',
    'health': 'health',
    'fitness': 'fitness',
    'finance': 'finance',
    'career': 'career',
    'learning': 'learning',
    'daily': 'daily'
  };

  for (const [keyword, topic] of Object.entries(topicKeywords)) {
    if (lowerInput.includes(keyword)) {
      requirements.topics.push(topic);
    }
  }

  // Default type based on category
  if (!type) {
    if (category === 'chat') {
      type = 'advice';
    } else {
      // Default functional types based on actions
      if (requirements.actions.includes('add') && requirements.actions.includes('delete')) {
        type = 'ideas'; // Simple CRUD list
      } else {
        type = 'ideas'; // Safe functional default
      }
    }
  }

  return {
    type,
    category, // 'functional' or 'chat'
    requirements,
    confidence: type !== 'advice' ? 0.8 : 0.6
  };
};

module.exports = {
  parseIntent,
  classifyFeatureCategory
};
