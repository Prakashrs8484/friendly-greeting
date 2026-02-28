/**
 * Feature Templates Service
 * Defines predefined feature templates with UI configs and agent requirements
 * 
 * TODO: Future enhancements:
 * - Advanced intent understanding: Use LLM to parse complex requirements
 * - Dynamic UI generation: Generate UI components based on requirements
 * - Custom templates: Allow users to create and save custom templates
 */

const FEATURE_TEMPLATES = {
  todo: {
    name: 'Todo Manager',
    description: 'Task management with add, edit, delete, and productivity insights',
    type: 'todo',
    category: 'functional',
    uiConfig: {
      layout: 'crud',
      components: ['list', 'form', 'insights'],
      actions: ['add', 'edit', 'delete', 'insights']
    },
    config: {
      enablePriorities: true,
      enableCategories: true,
      enableDueDates: true
    },
    requiredAgents: [
      {
        name: 'TodoManager',
        description: 'Manages todo items, handles CRUD operations',
        role: 'Task Management Assistant',
        tone: 'Friendly',
        config: {
          role: 'Task Management Assistant',
          tone: 'Friendly',
          creativity: 30,
          verbosity: 50,
          memoryEnabled: true
        }
      },
      {
        name: 'ProductivityAdvisor',
        description: 'Provides AI-powered productivity insights and suggestions',
        role: 'Productivity Advisor',
        tone: 'Motivational',
        config: {
          role: 'Productivity Advisor',
          tone: 'Motivational',
          creativity: 60,
          verbosity: 70,
          memoryEnabled: true
        }
      }
    ]
  },
  notes: {
    name: 'Notes Manager',
    description: 'Note-taking with summaries and AI suggestions',
    type: 'notes',
    category: 'functional',
    uiConfig: {
      layout: 'crud',
      components: ['list', 'editor', 'insights'],
      actions: ['add', 'edit', 'delete', 'summarize', 'suggestions']
    },
    config: {
      enableTags: true,
      enableCategories: true,
      enableSummaries: true
    },
    requiredAgents: [
      {
        name: 'NotesManager',
        description: 'Manages notes, handles CRUD operations',
        role: 'Notes Assistant',
        tone: 'Neutral',
        config: {
          role: 'Notes Assistant',
          tone: 'Neutral',
          creativity: 40,
          verbosity: 60,
          memoryEnabled: true
        }
      },
      {
        name: 'InsightGenerator',
        description: 'Generates summaries and suggestions from notes',
        role: 'Content Analyst',
        tone: 'Friendly',
        config: {
          role: 'Content Analyst',
          tone: 'Friendly',
          creativity: 70,
          verbosity: 60,
          memoryEnabled: true
        }
      }
    ]
  },
  advice: {
    name: 'Daily Advice',
    description: 'Get personalized advice on various topics',
    type: 'advice',
    category: 'chat',
    uiConfig: {
      layout: 'input-output',
      components: ['input', 'response'],
      actions: ['ask', 'get-advice']
    },
    config: {
      topics: [],
      enableHistory: true
    },
    requiredAgents: [
      {
        name: 'Advisor',
        description: 'Provides personalized advice',
        role: 'Personal Advisor',
        tone: 'Friendly',
        config: {
          role: 'Personal Advisor',
          tone: 'Friendly',
          creativity: 50,
          verbosity: 70,
          memoryEnabled: true
        }
      }
    ]
  },
  tracker: {
    name: 'Habit Tracker',
    description: 'Track habits and get progress insights',
    type: 'tracker',
    category: 'functional',
    uiConfig: {
      layout: 'dashboard',
      components: ['list', 'chart', 'insights'],
      actions: ['add', 'update', 'view-progress']
    },
    config: {
      enableStreaks: true,
      enableStats: true
    },
    requiredAgents: [
      {
        name: 'HabitTracker',
        description: 'Tracks habits and provides progress updates',
        role: 'Habit Coach',
        tone: 'Motivational',
        config: {
          role: 'Habit Coach',
          tone: 'Motivational',
          creativity: 40,
          verbosity: 60,
          memoryEnabled: true
        }
      }
    ]
  },
  insights: {
    name: 'Insights Dashboard',
    description: 'AI-powered insights and analytics',
    type: 'insights',
    category: 'functional',
    uiConfig: {
      layout: 'dashboard',
      components: ['charts', 'insights', 'recommendations'],
      actions: ['analyze', 'get-insights']
    },
    config: {
      enableCharts: true,
      enableRecommendations: true
    },
    requiredAgents: [
      {
        name: 'InsightAnalyst',
        description: 'Analyzes data and provides insights',
        role: 'Data Analyst',
        tone: 'Formal',
        config: {
          role: 'Data Analyst',
          tone: 'Formal',
          creativity: 50,
          verbosity: 70,
          memoryEnabled: true
        }
      }
    ]
  },
  ideas: {
    name: 'Daily Ideas',
    description: 'Capture and manage your daily ideas',
    type: 'ideas',
    category: 'functional',
    uiConfig: {
      layout: 'list',
      components: ['input', 'list', 'delete'],
      actions: ['add', 'delete']
    },
    config: {
      enableTimestamps: true,
      enableCategories: false
    },
    requiredAgents: [] // No agents required - pure functional UI
  },
  'research-tracker': {
    name: 'Research Tracker',
    description: 'Track and organize your research topics',
    type: 'research-tracker',
    category: 'functional',
    uiConfig: {
      layout: 'list',
      components: ['input', 'list', 'status', 'delete'],
      actions: ['add', 'update-status', 'delete']
    },
    config: {
      enableStatus: true,
      statusOptions: ['active', 'completed', 'on-hold']
    },
    requiredAgents: [] // No agents required - pure functional UI
  }
};

/**
 * Get feature template by type
 */
const getTemplate = (type) => {
  return FEATURE_TEMPLATES[type] || null;
};

/**
 * Get all available templates
 */
const getAllTemplates = () => {
  return Object.values(FEATURE_TEMPLATES);
};

module.exports = {
  FEATURE_TEMPLATES,
  getTemplate,
  getAllTemplates
};
