const mongoose = require('mongoose');

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
  // Legacy support for older saved blueprints.
  'chart',
  'summaryCard',
];

const fieldSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['text', 'number', 'date', 'time', 'select', 'textarea'],
      required: true,
    },
    label: { type: String, required: true },
    required: { type: Boolean, default: false },
    options: { type: [mongoose.Schema.Types.Mixed], default: [] },
  },
  { _id: false, strict: false }
);

const sectionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    component: {
      type: String,
      enum: SUPPORTED_COMPONENTS,
      required: true,
    },
    variant: {
      type: String,
      enum: ['compact', 'detailed', 'minimal'],
      default: undefined,
    },
    label: { type: String, required: true },
    description: { type: String, default: '' },
    fields: { type: [fieldSchema], default: [] },
    props: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { _id: false, strict: false }
);

const validateLayout = (layout) => {
  if (typeof layout === 'string') {
    return SUPPORTED_LAYOUTS.includes(layout);
  }

  if (!layout || typeof layout !== 'object') {
    return false;
  }

  if (!SUPPORTED_LAYOUTS.includes(layout.type)) {
    return false;
  }

  if (layout.columns === undefined) {
    return true;
  }

  return Number.isInteger(layout.columns) && layout.columns >= 1 && layout.columns <= 4;
};

const featureSchema = new mongoose.Schema({
  pageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AgentPage',
    required: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  // Legacy compatibility (older code paths still reference feature.type/uiConfig).
  type: {
    type: String,
    enum: ['todo', 'notes', 'advice', 'tracker', 'insights', 'ideas', 'research-tracker', 'custom'],
    default: 'custom',
  },
  uiConfig: {
    layout: { type: String },
    components: { type: [String], default: [] },
    actions: { type: [String], default: [] },
  },
  pageBlueprint: {
    featureName: { type: String, default: '' },
    description: { type: String, default: '' },
    layout: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      default: { type: 'vertical' },
      validate: {
        validator: validateLayout,
        message: 'layout must be vertical|grid|sidebar|dashboard (string or object with { type, columns? })',
      },
    },
    sections: {
      type: [sectionSchema],
      default: [],
      validate: {
        validator: (sections) => Array.isArray(sections) && sections.length > 0,
        message: 'pageBlueprint.sections must contain at least one section',
      },
    },
    dataModel: { type: [String], default: [] },
    aiCapabilities: { type: [String], default: [] },
  },
  category: {
    type: String,
    default: 'functional',
  },
  agentIds: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Agent',
    },
  ],
  originalInput: {
    type: String,
    required: true,
  },
  // Schema versioning for forward compatibility
  schemaVersion: {
    type: String,
    default: '1.0',
    enum: ['1.0'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

featureSchema.index({ pageId: 1, createdAt: -1 });

module.exports = mongoose.model('Feature', featureSchema);
