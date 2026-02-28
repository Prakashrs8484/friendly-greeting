const Feature = require('../models/feature.model');
const Agent = require('../models/agent.model');
const AgentPage = require('../models/agentPage.model');
const FeaturePlan = require('../models/featurePlan.model');
const { parseIntent } = require('./intentParser.service');
const { getTemplate } = require('./featureTemplates.service');
const { addAgent } = require('./agentPage.service');

/**
 * AI Feature Planner
 * Turns a natural-language idea into a structured feature plan (Lovable-style).
 *
 * This does NOT chat with the user. It only returns a structured JSON plan
 * describing:
 * - featureName
 * - type (planner-level type: tracker, planner, analytics, knowledge-collection, action-tool)
 * - description
 * - ui blocks (NeuraDesk-style components, no raw JSX)
 * - dataModel (entity fields)
 * - aiCapabilities (suggestions / insights / summaries / planning assistance)
 *
 * NOTE: The returned plan is stored in the Feature document (config.featurePlan)
 * and the frontend can render UI dynamically from this plan.
 */
const buildFeaturePlan = (userInput, intent, template) => {
  const lowerInput = userInput.toLowerCase();

  // 1) Classify high-level planner type
  let plannerType = 'planner';
  if (lowerInput.includes('track') || lowerInput.includes('tracker') || lowerInput.includes('log')) {
    plannerType = 'tracker';
  }
  if (lowerInput.includes('analytics') || lowerInput.includes('dashboard') || lowerInput.includes('report') || lowerInput.includes('insight')) {
    plannerType = 'analytics';
  }
  if (lowerInput.includes('decision') || lowerInput.includes('decide') || lowerInput.includes('choice')) {
    plannerType = 'decision';
  }
  if (lowerInput.includes('knowledge') || lowerInput.includes('notes') || lowerInput.includes('wiki') || lowerInput.includes('library')) {
    plannerType = 'knowledge-collection';
  }
  if (lowerInput.includes('automate') || lowerInput.includes('action') || lowerInput.includes('trigger') || lowerInput.includes('send')) {
    plannerType = 'action-tool';
  }

  // 2) Feature name & description
  const featureName = template?.name || (userInput.length > 60 ? `${userInput.slice(0, 57)}...` : userInput);
  const description = template?.description || userInput;

  // 3) Data model based on concrete feature type
  const dataModel = [];
  switch (intent.type) {
    case 'todo':
      dataModel.push('task', 'status', 'priority', 'dueDate', 'category');
      break;
    case 'notes':
      dataModel.push('note', 'title', 'tags', 'content', 'createdAt');
      break;
    case 'ideas':
      dataModel.push('idea', 'category', 'impact', 'effort', 'createdAt');
      break;
    case 'research-tracker':
      dataModel.push('topic', 'status', 'source', 'notes', 'nextStep');
      break;
    case 'tracker':
      dataModel.push('item', 'metric', 'value', 'timestamp');
      break;
    case 'insights':
      dataModel.push('metric', 'timeRange', 'segment', 'value');
      break;
    default:
      dataModel.push('item', 'status', 'meta');
      break;
  }

  // 4) UI blocks (NeuraDesk style, no raw JSX)
  const ui = [];
  if (plannerType === 'tracker') {
    ui.push(
      { component: 'PrimaryList', editable: true },
      { component: 'StatusSummaryBar' },
      { component: 'TrendChart', variant: 'placeholder' },
      { component: 'InsightsPanel' }
    );
  } else if (plannerType === 'analytics') {
    ui.push(
      { component: 'SummaryCards' },
      { component: 'TrendChart', variant: 'placeholder' },
      { component: 'BreakdownChart', variant: 'placeholder' },
      { component: 'InsightsPanel' }
    );
  } else if (plannerType === 'decision') {
    ui.push(
      { component: 'DecisionPrompt' },
      { component: 'OptionsList', editable: true },
      { component: 'RecommendationPanel' }
    );
  } else if (plannerType === 'knowledge-collection') {
    ui.push(
      { component: 'CollectionList', editable: true },
      { component: 'DetailPanel' },
      { component: 'InsightsPanel' }
    );
  } else if (plannerType === 'action-tool') {
    ui.push(
      { component: 'ActionQueueList', editable: true },
      { component: 'ActionSummary' },
      { component: 'InsightsPanel' }
    );
  } else {
    // Generic planner
    ui.push(
      { component: 'GoalList', editable: true },
      { component: 'WeeklySummaryCard' },
      { component: 'InsightsPanel' }
    );
  }

  // 5) AI capabilities
  const aiCapabilities = [];
  if (plannerType === 'tracker') {
    aiCapabilities.push('highlight trends', 'detect streaks or regressions', 'suggest next actions');
  } else if (plannerType === 'planner') {
    aiCapabilities.push('suggest priorities', 'detect overload', 'summarize plan for the period');
  } else if (plannerType === 'decision') {
    aiCapabilities.push('summarize options', 'weigh pros and cons', 'suggest a recommendation');
  } else if (plannerType === 'analytics') {
    aiCapabilities.push('surface key metrics', 'explain anomalies', 'suggest next questions to ask');
  } else if (plannerType === 'knowledge-collection') {
    aiCapabilities.push('summarize clusters of items', 'suggest tags or categories', 'surface related items');
  } else if (plannerType === 'action-tool') {
    aiCapabilities.push('recommend next actions', 'batch similar tasks', 'suggest automation opportunities');
  }

  return {
    featureName,
    type: plannerType,
    description,
    ui,
    dataModel,
    aiCapabilities
  };
};

/**
 * Feature Generation Service
 * Automatically creates features and agents based on natural language input
 * 
 * TODO: Future enhancements:
 * - Advanced intent understanding: Use LLM for complex feature planning
 * - Dynamic UI generation: Generate UI components programmatically
 * - Agent collaboration: Set up agent-to-agent communication for features
 * - Long-term memory: Integrate RAG for feature-specific context
 */

/**
 * Generate a feature from natural language input
 * @param {string} pageId - The Agent Page ID
 * @param {string} ownerId - The owner's user ID
 * @param {string} userInput - Natural language description of the feature
 * @returns {Promise<Object>} Created feature with agents
 */
const generateFeature = async (pageId, ownerId, userInput) => {
  try {
    console.log('[Feature Generation] Starting feature generation:', { pageId, userInput: userInput.substring(0, 100) });
    
    // 1. Parse user intent
    const intent = parseIntent(userInput);
    console.log('[Feature Generation] Parsed intent:', intent);
    
    // 2. Get feature template for concrete type (todo, notes, tracker, etc.)
    const template = getTemplate(intent.type);
    if (!template) {
      console.error('[Feature Generation] Template not found for type:', intent.type);
      throw new Error(`Feature type "${intent.type}" is not supported`);
    }
    console.log('[Feature Generation] Using template:', template.name);

    // 3. Build AI Feature Planner plan (Lovable-style)
    const featurePlan = buildFeaturePlan(userInput, intent, template);
    console.log('[Feature Generation] Built feature plan:', featurePlan);

    // 4. Merge user requirements with template
    // Generate feature name from user input if it contains specific keywords
    let featureName = featurePlan.featureName || template.name;
    const lowerInput = userInput.toLowerCase();
    
    // Extract custom name from user input
    if (lowerInput.includes('daily ideas') || lowerInput.includes('daily idea')) {
      featureName = 'Daily Ideas';
    } else if (lowerInput.includes('research') && (lowerInput.includes('track') || lowerInput.includes('keep'))) {
      featureName = 'Research Tracker';
    } else if (lowerInput.includes('ideas') && !lowerInput.includes('daily')) {
      featureName = 'Ideas';
    }
    
    const featureDescription = featurePlan.description || template.description || userInput;
    
    // Merge actions from user input with template defaults
    const actions = [...new Set([...template.uiConfig.actions, ...intent.requirements.actions])];
    
    // 5. Create feature
    const feature = new Feature({
      pageId,
      name: featureName,
      description: featureDescription,
      type: intent.type,
      category: template.category || intent.category || 'functional',
      uiConfig: {
        layout: template.uiConfig.layout,
        components: template.uiConfig.components,
        actions: actions
      },
      config: {
        ...template.config,
        topics: intent.requirements.topics.length > 0 ? intent.requirements.topics : template.config.topics || [],
        // Store the AI Feature Planner plan so the frontend can render dynamically
        featurePlan
      },
      originalInput: userInput,
      agentIds: []
    });

    // 6. Create agents ONLY if template requires them (optional for functional features)
    const createdAgents = [];
    if (template.requiredAgents && template.requiredAgents.length > 0) {
      console.log('[Feature Generation] Creating', template.requiredAgents.length, 'agent(s)');
      for (const agentTemplate of template.requiredAgents) {
      try {
        console.log('[Feature Generation] Creating agent:', agentTemplate.name);
        const agentData = {
          name: agentTemplate.name,
          description: agentTemplate.description,
          config: agentTemplate.config
        };
        
        const agent = await addAgent(pageId, ownerId, agentData);
        createdAgents.push(agent);
        feature.agentIds.push(agent._id);
          console.log('[Feature Generation] Agent created:', agent._id);
        } catch (err) {
          console.error(`[Feature Generation] Failed to create agent ${agentTemplate.name}:`, err);
          // Continue with other agents even if one fails
        }
      }
    } else {
      console.log('[Feature Generation] No agents required for this functional feature');
    }

    // 7. Save feature (even if no agents were created - functional features don't require agents)
    console.log('[Feature Generation] Saving feature...');
    await feature.save();
    console.log('[Feature Generation] Feature saved:', feature._id, 'Category:', feature.category);

    // 7b. Save feature plan for the page (for dynamic UI rendering)
    try {
      const planDoc = new FeaturePlan({
        pageId,
        featureName: featurePlan.featureName,
        type: featurePlan.type,
        description: featurePlan.description,
        ui: featurePlan.ui,
        dataModel: featurePlan.dataModel,
        aiCapabilities: featurePlan.aiCapabilities
      });
      await planDoc.save();
      console.log('[Feature Generation] Feature plan saved:', planDoc._id);
    } catch (planErr) {
      console.error('[Feature Generation] Failed to save feature plan:', planErr.message);
    }

    // 8. Update page's updatedAt timestamp
    await AgentPage.findByIdAndUpdate(pageId, { updatedAt: new Date() });

    // 9. Return feature with populated agents
    const populatedFeature = await Feature.findById(feature._id)
      .populate('agentIds')
      .lean();

    const result = {
      ...populatedFeature,
      _id: populatedFeature._id.toString(),
      pageId: populatedFeature.pageId.toString(),
      agentIds: (populatedFeature.agentIds || []).map(a => ({
        ...a,
        _id: a._id.toString(),
        pageId: a.pageId.toString()
      }))
    };

    console.log('[Feature Generation] Feature generation completed successfully');
    return result;
  } catch (err) {
    console.error('[Feature Generation] Error generating feature:', {
      error: err.message,
      stack: err.stack,
      pageId,
      userInput: userInput.substring(0, 100)
    });
    throw err; // Re-throw to be handled by controller
  }
};

/**
 * Get all features for a page
 * @param {string} pageId - The Agent Page ID
 * @returns {Promise<Array>} Array of features
 */
const getPageFeatures = async (pageId) => {
  const features = await Feature.find({ pageId })
    .populate('agentIds')
    .sort({ createdAt: -1 })
    .lean();

  return features.map(f => ({
    ...f,
    _id: f._id.toString(),
    pageId: f.pageId.toString(),
    agentIds: (f.agentIds || []).map(a => ({
      ...a,
      _id: a._id.toString(),
      pageId: a.pageId.toString()
    }))
  }));
};

/**
 * Delete a feature and optionally its agents
 * @param {string} featureId - The Feature ID
 * @param {boolean} deleteAgents - Whether to delete associated agents
 * @returns {Promise<Object>} Deletion result
 */
const deleteFeature = async (featureId, deleteAgents = false) => {
  const FeatureData = require('../models/featureData.model');
  const Message = require('../models/message.model');

  const feature = await Feature.findById(featureId);
  if (!feature) {
    throw new Error('Feature not found');
  }

  const pageId = feature.pageId;
  const agentIds = (feature.agentIds || []).map(a => a.toString());

  console.log('[Feature Generation] [DB WRITE] Cascade deleting feature:', {
    featureId,
    pageId: pageId.toString(),
    deleteAgents,
    agentCount: agentIds.length
  });

  // 1) Remove all feature-specific data (source of truth)
  const fdResult = await FeatureData.deleteMany({ pageId, featureId: feature._id });
  console.log('[Feature Generation] [DB WRITE] Deleted FeatureData docs:', fdResult.deletedCount);

  // 2) Remove AI insights/messages linked to this feature (page-level memory)
  // (featureId-linked messages only; avoids deleting other features' summaries)
  const msgResult = await Message.deleteMany({ pageId, featureId: feature._id });
  console.log('[Feature Generation] [DB WRITE] Deleted feature-linked Messages:', msgResult.deletedCount);

  // Best-effort cleanup for legacy feature event messages that may not have featureId set
  const legacyEventResult = await Message.deleteMany({
    pageId,
    featureId: null,
    source: 'feature',
    content: { $regex: `Feature \"${feature.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\"`, $options: 'i' }
  });
  if (legacyEventResult.deletedCount) {
    console.log('[Feature Generation] [DB WRITE] Deleted legacy feature event Messages:', legacyEventResult.deletedCount);
  }

  // 3) Ensure agents tied to this feature no longer execute
  // Delete associated agents + their chat history if requested (frontend should pass deleteAgents=true)
  if (deleteAgents && agentIds.length > 0) {
    const agentMsgResult = await Message.deleteMany({ pageId, agentId: { $in: agentIds } });
    console.log('[Feature Generation] [DB WRITE] Deleted agent thread Messages:', agentMsgResult.deletedCount);

    const agentDeleteResult = await Agent.deleteMany({ _id: { $in: agentIds } });
    console.log('[Feature Generation] [DB WRITE] Deleted Agents:', agentDeleteResult.deletedCount);
  }

  // Delete feature
  await Feature.findByIdAndDelete(featureId);

  // Update page timestamp
  await AgentPage.findByIdAndUpdate(pageId, { updatedAt: new Date() });

  return { message: 'Feature deleted successfully' };
};

module.exports = {
  generateFeature,
  getPageFeatures,
  deleteFeature
};
