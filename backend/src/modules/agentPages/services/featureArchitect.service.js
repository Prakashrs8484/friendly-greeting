/**
 * Feature Architect Service
 * 
 * Extracts domain context from user input and generates contextually-specific
 * feature names and section labels that reflect the user's request exactly.
 * 
 * NO GENERIC TEMPLATES like "Daily Ideas", "Todo", "Entries"
 * Each feature has unique, domain-appropriate labels.
 */

/**
 * Domain context mapping
 * Maps keywords to their domain-specific vocabulary
 */
const DOMAIN_VOCABULARY = {
  // Health & Fitness
  'workout|exercise|gym|training': {
    domain: 'fitness',
    entity: 'workout',
    formLabel: 'Log Workout',
    listLabel: 'Workout History',
    counterLabel: 'Total Workouts',
    chartLabel: 'Workout Trends',
    insightLabel: 'Fitness Insights'
  },
  'water|hydration|intake': {
    domain: 'health',
    entity: 'water intake',
    formLabel: 'Log Water Intake',
    listLabel: 'Daily Intake Log',
    counterLabel: 'Total Cups/Liters',
    chartLabel: 'Hydration Trends',
    insightLabel: 'Hydration Insights'
  },
  'meal|food|nutrition|diet': {
    domain: 'nutrition',
    entity: 'meal',
    formLabel: 'Log Meal',
    listLabel: 'Meal History',
    counterLabel: 'Total Meals',
    chartLabel: 'Nutrition Trends',
    insightLabel: 'Nutritional Insights'
  },
  'sleep|rest': {
    domain: 'wellness',
    entity: 'sleep session',
    formLabel: 'Log Sleep',
    listLabel: 'Sleep Log',
    counterLabel: 'Sleep Hours',
    chartLabel: 'Sleep Patterns',
    insightLabel: 'Sleep Insights'
  },

  // Productivity & Work
  'task|todo|project|work': {
    domain: 'productivity',
    entity: 'task',
    formLabel: 'Create Task',
    listLabel: 'Task List',
    counterLabel: 'Total Tasks',
    chartLabel: 'Task Progress',
    insightLabel: 'Productivity Insights'
  },
  'goal|objective': {
    domain: 'goal-tracking',
    entity: 'goal',
    formLabel: 'Set Goal',
    listLabel: 'Goals',
    counterLabel: 'Active Goals',
    chartLabel: 'Progress Tracking',
    insightLabel: 'Goal Insights'
  },
  'habit|routine': {
    domain: 'habits',
    entity: 'habit',
    formLabel: 'Track Habit',
    listLabel: 'Habit Log',
    counterLabel: 'Habit Streak',
    chartLabel: 'Habit Consistency',
    insightLabel: 'Habit Insights'
  },
  'idea|inspiration|brainstorm': {
    domain: 'creativity',
    entity: 'idea',
    formLabel: 'Capture Idea',
    listLabel: 'Ideas',
    counterLabel: 'Total Ideas',
    chartLabel: 'Idea Trends',
    insightLabel: 'Creative Insights'
  },

  // Finance
  'budget|expense|spending|money|finance': {
    domain: 'finance',
    entity: 'expense',
    formLabel: 'Add Expense',
    listLabel: 'Expense List',
    counterLabel: 'Total Spent',
    chartLabel: 'Spending Trends',
    insightLabel: 'Financial Insights'
  },
  'income|earning|salary|earning': {
    domain: 'finance',
    entity: 'income',
    formLabel: 'Record Income',
    listLabel: 'Income History',
    counterLabel: 'Total Income',
    chartLabel: 'Income Trends',
    insightLabel: 'Revenue Insights'
  },
  'investment|stock|portfolio': {
    domain: 'investing',
    entity: 'investment',
    formLabel: 'Log Investment',
    listLabel: 'Portfolio',
    counterLabel: 'Total Investments',
    chartLabel: 'Portfolio Performance',
    insightLabel: 'Investment Insights'
  },
  'bill|debt|loan|payment': {
    domain: 'finance',
    entity: 'bill',
    formLabel: 'Track Bill',
    listLabel: 'Bills',
    counterLabel: 'Outstanding Bills',
    chartLabel: 'Payment Schedule',
    insightLabel: 'Debt Insights'
  },

  // Learning & Development
  'course|learning|study|skill': {
    domain: 'learning',
    entity: 'course',
    formLabel: 'Log Study Session',
    listLabel: 'Study History',
    counterLabel: 'Hours Studied',
    chartLabel: 'Learning Progress',
    insightLabel: 'Learning Insights'
  },
  'book|reading|article': {
    domain: 'learning',
    entity: 'book',
    formLabel: 'Add Book',
    listLabel: 'Reading List',
    counterLabel: 'Books Read',
    chartLabel: 'Reading Progress',
    insightLabel: 'Reading Insights'
  },

  // Personal
  'mood|emotion|feeling': {
    domain: 'wellness',
    entity: 'mood entry',
    formLabel: 'Log Mood',
    listLabel: 'Mood Journal',
    counterLabel: 'Mood Entries',
    chartLabel: 'Mood Patterns',
    insightLabel: 'Emotional Insights'
  },
  'note|journal|memory|diary': {
    domain: 'personal',
    entity: 'note',
    formLabel: 'Write Note',
    listLabel: 'Journal Entries',
    counterLabel: 'Total Notes',
    chartLabel: 'Journal Timeline',
    insightLabel: 'Personal Insights'
  },
  'contact|relationship|person': {
    domain: 'social',
    entity: 'contact',
    formLabel: 'Add Contact',
    listLabel: 'Contacts',
    counterLabel: 'Total Contacts',
    chartLabel: 'Relationship Map',
    insightLabel: 'Social Insights'
  },

  // Business & Sales
  'client|lead|opportunity': {
    domain: 'sales',
    entity: 'lead',
    formLabel: 'Add Lead',
    listLabel: 'Pipeline',
    counterLabel: 'Total Leads',
    chartLabel: 'Sales Funnel',
    insightLabel: 'Sales Insights'
  },
  'customer|account': {
    domain: 'business',
    entity: 'customer',
    formLabel: 'Add Customer',
    listLabel: 'Customer List',
    counterLabel: 'Total Customers',
    chartLabel: 'Customer Growth',
    insightLabel: 'Customer Insights'
  },
  'project|campaign': {
    domain: 'business',
    entity: 'project',
    formLabel: 'Create Project',
    listLabel: 'Projects',
    counterLabel: 'Active Projects',
    chartLabel: 'Project Timeline',
    insightLabel: 'Project Insights'
  },

  // Travel & Events
  'trip|travel|destination': {
    domain: 'travel',
    entity: 'trip',
    formLabel: 'Plan Trip',
    listLabel: 'Trips',
    counterLabel: 'Places Visited',
    chartLabel: 'Travel Timeline',
    insightLabel: 'Travel Insights'
  },
  'event|meetup|meeting': {
    domain: 'events',
    entity: 'event',
    formLabel: 'Schedule Event',
    listLabel: 'Events',
    counterLabel: 'Total Events',
    chartLabel: 'Event Calendar',
    insightLabel: 'Event Insights'
  },

  // Hobby & Collections
  'collection|item|collectible': {
    domain: 'hobbies',
    entity: 'item',
    formLabel: 'Add Item',
    listLabel: 'Collection',
    counterLabel: 'Total Items',
    chartLabel: 'Collection Growth',
    insightLabel: 'Collection Insights'
  },
  'plant|garden|pet': {
    domain: 'hobbies',
    entity: 'item',
    formLabel: 'Log Care Session',
    listLabel: 'Care History',
    counterLabel: 'Care Actions',
    chartLabel: 'Health Timeline',
    insightLabel: 'Care Insights'
  }
};

/**
 * Extract domain context from user input
 * @param {string} userInput - User's feature request
 * @returns {Object} - { domain, entity, vocabulary }
 */
const extractDomainContext = (userInput) => {
  const lowerInput = userInput.toLowerCase();

  // Try to find a matching domain from vocabulary
  for (const [keywords, vocab] of Object.entries(DOMAIN_VOCABULARY)) {
    const keywordArray = keywords.split('|');
    for (const keyword of keywordArray) {
      if (lowerInput.includes(keyword)) {
        return {
          domain: vocab.domain,
          entity: vocab.entity,
          vocabulary: vocab,
          matchedKeyword: keyword
        };
      }
    }
  }

  // Fallback: generic domain
  return {
    domain: 'general',
    entity: 'item',
    vocabulary: {
      domain: 'general',
      entity: 'item',
      formLabel: 'Add Entry',
      listLabel: 'Items',
      counterLabel: 'Total Items',
      chartLabel: 'Trends',
      insightLabel: 'Insights'
    },
    matchedKeyword: null
  };
};

/**
 * Generate contextual section labels for a feature
 * @param {string} userInput - User's feature request
 * @param {string} featureType - Detected feature type (tracker, planner, etc.)
 * @returns {Object} - { formLabel, listLabel, counterLabel, chartLabel, insightLabel, domain }
 */
const generateContextualLabels = (userInput, featureType) => {
  const context = extractDomainContext(userInput);

  // Return domain-specific labels
  return {
    formLabel: context.vocabulary.formLabel,
    listLabel: context.vocabulary.listLabel,
    counterLabel: context.vocabulary.counterLabel,
    chartLabel: context.vocabulary.chartLabel,
    insightLabel: context.vocabulary.insightLabel,
    domain: context.domain,
    entity: context.entity,
    matchedKeyword: context.matchedKeyword
  };
};

/**
 * Build sections with contextual labels
 * @param {string} userInput - User's feature request
 * @param {boolean} isTracker - Is this a tracker-type feature
 * @param {boolean} isAnalytics - Is this an analytics-type feature
 * @param {boolean} isDecision - Is this a decision-type feature
 * @param {boolean} isPlanner - Is this a planner-type feature
 * @returns {Array} - Array of section objects with contextual labels
 */
const buildContextualSections = (
  userInput,
  isTracker,
  isAnalytics,
  isDecision,
  isPlanner
) => {
  const labels = generateContextualLabels(userInput);
  const sections = [];

  // 1) Data entry section for trackers/planners
  if (isTracker || isPlanner) {
    sections.push({
      component: 'form',
      label: labels.formLabel, // Context-specific, e.g., "Log Workout"
      description: `Record a new ${labels.entity}`,
      fields: ['name', 'date', 'notes'],
      editable: true,
      collapsible: true
    });
  }

  // 2) List section for viewing data
  sections.push({
    component: 'list',
    label: labels.listLabel, // Context-specific, e.g., "Workout History"
    description: `View and manage your ${labels.entity}s`,
    editable: true,
    fields: ['name', 'date', 'notes'],
    sortable: true,
    filterable: true
  });

  // 3) Summary/counter for trackers
  if (isTracker) {
    sections.push({
      component: 'counter',
      label: labels.counterLabel, // Context-specific, e.g., "Total Workouts"
      description: `Overall ${labels.entity} summary`,
      metric: 'count'
    });
  }

  // 4) Analytics/charts for analytics/trackers
  if (isAnalytics || isTracker) {
    sections.push({
      component: 'chart',
      label: labels.chartLabel, // Context-specific, e.g., "Workout Trends"
      description: `Visual analysis of your ${labels.entity} data`,
      chartType: 'line',
      timeRange: 'week'
    });
  }

  // 5) Decision support for decision tools
  if (isDecision) {
    sections.push({
      component: 'form',
      label: 'Compare Options',
      description: 'Add options to compare',
      fields: ['option', 'pros', 'cons'],
      editable: true
    });
    sections.push({
      component: 'summaryCard',
      label: 'Recommendation',
      description: 'AI-suggested best option',
      aiEnabled: true
    });
  }

  // 6) AI Insights panel (for all features) - contextual
  sections.push({
    component: 'insightPanel',
    label: labels.insightLabel, // Context-specific, e.g., "Fitness Insights"
    description: `Personalized ${labels.domain} insights and recommendations`,
    aiEnabled: true
  });

  return sections;
};

module.exports = {
  extractDomainContext,
  generateContextualLabels,
  buildContextualSections
};
