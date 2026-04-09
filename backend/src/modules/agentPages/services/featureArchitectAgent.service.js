const groq = require('../../system/services/groq.service');

const SUPPORTED_LAYOUTS = ['vertical', 'grid', 'sidebar', 'dashboard'];
const SUPPORTED_COMPONENTS = [
  'form',
  'list',
  'table',
  'kanban',
  'calendar',
  'timeline',
  'chart-bar',
  'chart-line',
  'chart-pie',
  'kpi-grid',
  'tabs',
  'accordion',
  'progressTracker',
  'comparisonTable',
  'filterBar',
  'tagSelector',
  'streakTracker',
  'metricBoard',
  'insightPanel',
  'recommendationCards',
  'nextStepPlanner',
  'anomalyAlerts',
  'semanticFilterRail',
  'decisionPlaybook',
];

const VALID_FIELD_TYPES = ['text', 'number', 'date', 'time', 'select', 'textarea'];

function toLabel(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toFieldName(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
}

function inferFieldType(nameOrLabel) {
  const text = String(nameOrLabel || '').toLowerCase();
  if (/(date|day|deadline|due)/.test(text)) return 'date';
  if (/(time|hour|minute|duration)/.test(text)) return 'time';
  if (/(amount|price|cost|total|value|count|qty|quantity|score|percent|rating|number)/.test(text)) {
    return 'number';
  }
  if (/(note|description|details|summary|comment|reason|insight)/.test(text)) return 'textarea';
  if (/(type|status|category|priority|level|tag|segment)/.test(text)) return 'select';
  return 'text';
}

function normalizeFields(fields) {
  if (!Array.isArray(fields)) return [];

  const normalized = [];

  for (const rawField of fields) {
    if (typeof rawField === 'string') {
      const name = toFieldName(rawField);
      if (!name) continue;

      normalized.push({
        name,
        type: inferFieldType(rawField),
        label: toLabel(rawField) || name,
        required: false,
      });
      continue;
    }

    if (!rawField || typeof rawField !== 'object') {
      continue;
    }

    const rawName = rawField.name || rawField.key || rawField.id || '';
    const rawLabel = rawField.label || rawField.title || rawName;
    const name = toFieldName(rawName || rawLabel);
    if (!name) continue;

    const type = VALID_FIELD_TYPES.includes(rawField.type)
      ? rawField.type
      : inferFieldType(rawName || rawLabel);

    const field = {
      name,
      type,
      label: typeof rawField.label === 'string' && rawField.label.trim()
        ? rawField.label.trim()
        : toLabel(rawLabel) || name,
      required: Boolean(rawField.required),
    };

    if (Array.isArray(rawField.options)) {
      field.options = rawField.options;
    }

    normalized.push(field);
  }

  return normalized;
}

function buildArchitectSystemPrompt() {
  return `You are FeatureArchitect, an expert UI/UX designer and schema generator.
Your job is to turn natural language feature descriptions into complete, schema-driven UI blueprints.

CRITICAL RULES:
1. Output ONLY valid JSON - no explanation, no markdown, no text outside JSON.
2. Do NOT invent new feature types. Only compose using supported section components.
3. Choose components based on user intent and data shape.
4. Avoid repetitive form+list structure unless user explicitly asks for simple CRUD input flow.
5. Prefer richer composition (analytics, progress, comparison, planning, and insights) when applicable.
6. Every feature must include ONE primary AI section selected by user intent (not always insightPanel).
7. layout must be an object: { "type": "grid|dashboard|vertical|sidebar", "columns"?: 1-4 }.
8. Each section can include:
   - variant: "compact" | "detailed" | "minimal"
   - fields: array (for form-like structures)
   - props: object (component-specific configuration, sample data, labels, defaults)

SUPPORTED COMPONENTS:
- form
- list
- table
- kanban
- calendar
- timeline
- chart-bar
- chart-line
- chart-pie
- kpi-grid
- tabs
- accordion
- progressTracker
- comparisonTable
- filterBar
- tagSelector
- streakTracker
- metricBoard
- insightPanel
- recommendationCards
- nextStepPlanner
- anomalyAlerts
- semanticFilterRail
- decisionPlaybook

OUTPUT SCHEMA:
{
  "featureName": "Exact title from user input",
  "description": "User request in one sentence",
  "layout": {
    "type": "grid|dashboard|vertical|sidebar",
    "columns": 2
  },
  "sections": [
    {
      "id": "section_1",
      "component": "one of supported components",
      "variant": "compact|detailed|minimal",
      "label": "Domain-specific section title",
      "description": "What this section does",
      "fields": [],
      "props": {}
    }
  ],
  "dataModel": ["field1", "field2"],
  "aiCapabilities": ["capability1", "capability2"]
}

INTENT-TO-COMPOSITION GUIDANCE:
- Workout planner -> calendar + table + progressTracker
- Budget tracker -> table + chart-pie + kpi-grid
- Habit tracker -> streakTracker + chart-line
- Decision tool -> comparisonTable + decisionPlaybook
- Planning/project goals -> timeline + progressTracker + nextStepPlanner
- Analytics/operations monitoring -> kpi-grid + chart-line + anomalyAlerts
- Research/knowledge management -> table/list + semanticFilterRail + recommendationCards

When form/list is used, pair it with richer visual or analytical sections if the use case needs tracking, trends, comparisons, or planning.`;
}

function nextSectionId(sections) {
  return `section_${sections.length + 1}`;
}

function ensureSection(sections, component, defaults = {}) {
  const exists = sections.some((section) => section.component === component);
  if (exists) return;

  sections.push({
    id: nextSectionId(sections),
    component,
    variant: 'detailed',
    label: defaults.label || component,
    description: defaults.description || '',
    props: defaults.props || {},
  });
}

function normalizeLayout(layout) {
  if (typeof layout === 'string' && SUPPORTED_LAYOUTS.includes(layout)) {
    return {
      type: layout,
      columns: layout === 'dashboard' ? 3 : 2,
    };
  }

  if (layout && typeof layout === 'object') {
    return {
      type: SUPPORTED_LAYOUTS.includes(layout.type) ? layout.type : 'vertical',
      ...(layout.columns !== undefined ? { columns: layout.columns } : {}),
    };
  }

  return { type: 'vertical' };
}

function classifyIntent(input) {
  if (/decision|compare|comparison|choice|options|tradeoff/.test(input)) {
    return 'decision';
  }
  if (/plan|planning|roadmap|milestone|goal|strategy|schedule|project/.test(input)) {
    return 'planning';
  }
  if (/monitor|anomaly|alert|kpi|metrics|analytics|dashboard|operations|trend/.test(input)) {
    return 'analysis';
  }
  if (/research|knowledge|notes|content|library|learn|documentation/.test(input)) {
    return 'knowledge';
  }
  if (/habit|routine|streak|tracker|track|fitness|budget|expense|finance/.test(input)) {
    return 'tracking';
  }
  return 'general';
}

function getAiComponentForIntent(intent) {
  switch (intent) {
    case 'decision':
      return 'decisionPlaybook';
    case 'planning':
      return 'nextStepPlanner';
    case 'analysis':
      return 'anomalyAlerts';
    case 'knowledge':
      return 'semanticFilterRail';
    case 'tracking':
      return 'recommendationCards';
    default:
      return 'insightPanel';
  }
}

function ensureAiSection(sections, aiComponent) {
  const aiComponents = [
    'insightPanel',
    'recommendationCards',
    'nextStepPlanner',
    'anomalyAlerts',
    'semanticFilterRail',
    'decisionPlaybook',
  ];

  const nonAiSections = sections.filter((section) => !aiComponents.includes(section.component));
  const existingPrimary = sections.find((section) => aiComponents.includes(section.component));

  const selected = existingPrimary && existingPrimary.component === aiComponent
    ? existingPrimary
    : {
        id: nextSectionId(nonAiSections),
        component: aiComponent,
        variant: 'detailed',
        label: 'AI Copilot',
        description: 'AI guidance tailored to this feature context',
        props: {
          actionLabel: 'Generate AI Guidance',
          loadingLabel: 'Analyzing workspace with AI...',
        },
      };

  return [...nonAiSections, selected];
}

function ensureAICapabilityForComponent(aiCapabilities, aiComponent) {
  const capabilityMap = {
    insightPanel: ['general insights', 'summaries'],
    recommendationCards: ['recommendations', 'prioritization'],
    nextStepPlanner: ['next-step suggestions', 'plan sequencing'],
    anomalyAlerts: ['pattern detection', 'anomaly alerts'],
    semanticFilterRail: ['semantic clustering', 'context filters'],
    decisionPlaybook: ['decision support', 'tradeoff analysis'],
  };

  const needed = capabilityMap[aiComponent] || ['general insights'];
  for (const capability of needed) {
    if (!aiCapabilities.includes(capability)) {
      aiCapabilities.push(capability);
    }
  }
}

function applyIntentCompositionRules(schema, userInput) {
  const input = String(userInput || '').toLowerCase();
  let sections = Array.isArray(schema.sections) ? schema.sections : [];
  const aiCapabilities = Array.isArray(schema.aiCapabilities) ? schema.aiCapabilities : [];
  const intent = classifyIntent(input);
  const aiComponent = getAiComponentForIntent(intent);

  schema.layout = normalizeLayout(schema.layout);

  if (/workout|exercise|training|gym/.test(input)) {
    ensureSection(sections, 'calendar', {
      label: 'Workout Calendar',
      description: 'Plan and review workout sessions by date',
    });
    ensureSection(sections, 'table', {
      label: 'Workout Log',
      description: 'Track exercises, sets, reps, and duration',
    });
    ensureSection(sections, 'progressTracker', {
      label: 'Progress Tracker',
      description: 'Monitor workout consistency and completion',
    });
  }

  if (/budget|expense|spending|finance|money/.test(input)) {
    ensureSection(sections, 'table', {
      label: 'Budget Entries',
      description: 'Track and review budget line items',
    });
    ensureSection(sections, 'chart-pie', {
      label: 'Spending Breakdown',
      description: 'Visualize distribution across categories',
    });
    ensureSection(sections, 'kpi-grid', {
      label: 'Budget KPIs',
      description: 'Key budget metrics and health indicators',
    });
  }

  if (/habit|routine|streak/.test(input)) {
    ensureSection(sections, 'streakTracker', {
      label: 'Streak Tracker',
      description: 'Track daily consistency and streak goals',
    });
    ensureSection(sections, 'chart-line', {
      label: 'Progress Trend',
      description: 'View progress trends over time',
    });
  }

  if (/decision|compare|comparison|choice|options/.test(input)) {
    ensureSection(sections, 'comparisonTable', {
      label: 'Option Comparison',
      description: 'Compare alternatives side-by-side',
    });
    ensureSection(sections, 'decisionPlaybook', {
      label: 'Decision Playbook',
      description: 'AI-generated insights and tradeoff guidance',
    });
  }

  if (/plan|planning|roadmap|milestone|goal|strategy|schedule|project/.test(input)) {
    ensureSection(sections, 'timeline', {
      label: 'Plan Timeline',
      description: 'Track milestones and schedule flow',
    });
    ensureSection(sections, 'nextStepPlanner', {
      label: 'Next Step Planner',
      description: 'AI-prioritized action sequence based on progress',
    });
  }

  if (/monitor|anomaly|alert|kpi|metrics|analytics|dashboard|operations|trend/.test(input)) {
    ensureSection(sections, 'kpi-grid', {
      label: 'Operational KPIs',
      description: 'Key metrics and status indicators',
    });
    ensureSection(sections, 'anomalyAlerts', {
      label: 'Anomaly Alerts',
      description: 'AI-detected outliers and regressions',
    });
  }

  if (/research|knowledge|notes|content|library|learn|documentation/.test(input)) {
    ensureSection(sections, 'semanticFilterRail', {
      label: 'Semantic Filter Rail',
      description: 'AI-suggested clusters to filter and explore information',
    });
  }

  sections = ensureAiSection(sections, aiComponent);

  const aiComponents = new Set([
    'insightPanel',
    'recommendationCards',
    'nextStepPlanner',
    'anomalyAlerts',
    'semanticFilterRail',
    'decisionPlaybook',
  ]);
  const nonAiSections = sections.filter((section) => !aiComponents.has(section.component));
  const uniqueComponents = new Set(nonAiSections.map((section) => section.component));
  const onlySimpleFlow =
    uniqueComponents.size > 0 &&
    [...uniqueComponents].every((component) => component === 'form' || component === 'list');

  if (onlySimpleFlow && nonAiSections.length <= 2) {
    sections = ensureAiSection(sections, 'recommendationCards');
    ensureSection(sections, 'recommendationCards', {
      label: 'Insights',
      description: 'AI recommendations based on your entries',
    });
  }

  const finalAiSection = sections.find((section) => aiComponents.has(section.component));
  ensureAICapabilityForComponent(aiCapabilities, finalAiSection?.component || aiComponent);

  schema.sections = sections.map((section, index) => ({
    ...section,
    id: section.id || `section_${index + 1}`,
    variant: ['compact', 'detailed', 'minimal'].includes(section.variant)
      ? section.variant
      : 'detailed',
    fields: normalizeFields(section.fields),
    props: section.props && typeof section.props === 'object' ? section.props : {},
  }));

  schema.aiCapabilities = aiCapabilities;

  return schema;
}

function validateSchema(schema) {
  if (!schema || typeof schema !== 'object') {
    throw new Error('Schema must be an object');
  }

  if (!schema.featureName) throw new Error('Missing featureName');
  if (!schema.description) throw new Error('Missing description');

  if (!schema.layout) {
    throw new Error('Missing layout');
  }

  let layoutValid = false;
  if (typeof schema.layout === 'string') {
    layoutValid = SUPPORTED_LAYOUTS.includes(schema.layout);
  } else if (typeof schema.layout === 'object' && schema.layout.type) {
    const columnsValid =
      schema.layout.columns === undefined ||
      (Number.isInteger(schema.layout.columns) && schema.layout.columns >= 1 && schema.layout.columns <= 4);
    layoutValid = SUPPORTED_LAYOUTS.includes(schema.layout.type) && columnsValid;
  }

  if (!layoutValid) {
    throw new Error(`Invalid layout: ${JSON.stringify(schema.layout)}`);
  }

  if (!Array.isArray(schema.sections) || schema.sections.length === 0) {
    throw new Error('sections must be non-empty array');
  }
  if (!Array.isArray(schema.dataModel)) {
    throw new Error('dataModel must be array');
  }
  if (!Array.isArray(schema.aiCapabilities)) {
    throw new Error('aiCapabilities must be array');
  }

  for (const section of schema.sections) {
    if (!section.id) throw new Error('Section missing id');
    if (!section.component || !SUPPORTED_COMPONENTS.includes(section.component)) {
      throw new Error(`Invalid component: ${section.component}`);
    }
    if (!section.label || typeof section.label !== 'string') {
      throw new Error('Section missing label');
    }
    if (section.variant && !['compact', 'detailed', 'minimal'].includes(section.variant)) {
      throw new Error(`Invalid variant: ${section.variant}`);
    }
    if (section.props !== undefined && (typeof section.props !== 'object' || Array.isArray(section.props))) {
      throw new Error(`Invalid props object in section: ${section.id}`);
    }
    if (section.fields !== undefined && !Array.isArray(section.fields)) {
      throw new Error(`Invalid fields in section: ${section.id}`);
    }
    if (Array.isArray(section.fields)) {
      for (const field of section.fields) {
        if (!field || typeof field !== 'object' || !field.name || !field.type) {
          throw new Error('Field missing name or type');
        }
        if (!VALID_FIELD_TYPES.includes(field.type)) {
          throw new Error(`Invalid field type: ${field.type}`);
        }
      }
    }
  }
}

async function generateFeatureSchema(userInput) {
  try {
    console.log('[FeatureArchitectAgent] Generating schema for:', userInput);

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: buildArchitectSystemPrompt() },
        { role: 'user', content: `User Request: "${userInput}"\n\nGenerate a complete feature schema.` },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      top_p: 0.95,
    });

    const schemaText = response.choices[0]?.message?.content?.trim() || '';
    console.log('[FeatureArchitectAgent] Raw LLM response:', schemaText.substring(0, 200));

    let schema;
    try {
      schema = JSON.parse(schemaText);
    } catch (parseError) {
      const jsonMatch = schemaText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (!jsonMatch) throw parseError;
      schema = JSON.parse(jsonMatch[1]);
    }

    const normalizedSchema = applyIntentCompositionRules(schema, userInput);
    validateSchema(normalizedSchema);
    console.log('[FeatureArchitectAgent] Generated schema:', normalizedSchema);

    return normalizedSchema;
  } catch (error) {
    console.error('[FeatureArchitectAgent] Error generating schema:', error);
    throw error;
  }
}

module.exports = {
  generateFeatureSchema,
};
