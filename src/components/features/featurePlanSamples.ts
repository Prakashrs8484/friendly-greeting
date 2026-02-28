import type { Feature, FeaturePlan } from "@/lib/agentPageApi";

export const SAMPLE_FEATURE_PLANS: FeaturePlan[] = [
  {
    featureName: "Weekly Planner",
    type: "planner",
    description: "Plan weekly goals with progress and insights",
    ui: [
      { component: "GoalList", editable: true },
      { component: "WeeklySummaryCard" },
      { component: "InsightsPanel" }
    ],
    dataModel: ["goal", "status", "date"],
    aiCapabilities: ["suggest next best goal", "summarize progress", "detect overload"]
  },
  {
    featureName: "Weekly Productivity Analytics",
    type: "analytics",
    description: "Analyze weekly output with trends and breakdowns",
    ui: [
      { component: "SummaryCards" },
      { component: "TrendChart", variant: "placeholder" },
      { component: "BreakdownChart", variant: "placeholder" },
      { component: "InsightsPanel" }
    ],
    dataModel: ["metric", "value", "dateRange"],
    aiCapabilities: ["surface key metrics", "explain anomalies", "suggest next questions"]
  },
  {
    featureName: "Decision Room Builder",
    type: "decision",
    description: "Structure decisions with options and a recommendation",
    ui: [
      { component: "DecisionPrompt" },
      { component: "OptionsList", editable: true },
      { component: "RecommendationPanel" }
    ],
    dataModel: ["decision", "option", "criteria", "recommendation"],
    aiCapabilities: ["summarize options", "weigh pros and cons", "suggest a recommendation"]
  }
];

export const buildSampleFeatures = (pageId?: string): Feature[] => {
  const now = new Date().toISOString();
  return SAMPLE_FEATURE_PLANS.map((plan, idx) => ({
    _id: `sample-${idx}-${plan.type}`,
    pageId: pageId || "sample",
    name: plan.featureName,
    description: plan.description,
    type: "custom",
    category: "functional",
    uiConfig: {
      layout: "custom",
      components: [],
      actions: []
    },
    config: {
      featurePlan: plan
    },
    featurePlan: plan,
    agentIds: [],
    originalInput: "sample",
    createdAt: now,
    updatedAt: now
  }));
};
