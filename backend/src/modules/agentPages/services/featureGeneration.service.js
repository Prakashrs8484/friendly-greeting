const Feature = require('../models/feature.model');
const Agent = require('../models/agent.model');
const AgentPage = require('../models/agentPage.model');
const FeaturePlan = require('../models/featurePlan.model');
const { parseIntent } = require('./intentParser.service');
const { getTemplate } = require('./featureTemplates.service');
const { addAgent } = require('./agentPage.service');
const { buildContextualSections } = require('./featureArchitect.service');

/**
 * AI Feature Planner - FULLY DYNAMIC SCHEMA-DRIVEN
 * Turns natural language into a flexible UI schema with contextual labels.
 *
 * Generates:
 * - featureName: Extracted from user input (exact match)
 * - description: User's original request
 * - sections: Contextually-labeled generic components based on domain
 * - dataModel: Entity fields specific to the domain
 * - aiCapabilities: AI-powered features relevant to the domain
 *
 * NO hardcoded feature types. NO generic labels like "Entries" or "Daily Ideas".
 * Each feature has unique, domain-appropriate section names.
 */
const buildFeaturePlan = (userInput, intent, template) => {
  const lowerInput = userInput.toLowerCase();

  // Feature name & description - ALWAYS from user input, never from template
  // Convert user input to proper feature name (title case, remove extra words)
  let featureName = userInput.trim();
  
  // Title case the feature name
  featureName = featureName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  
  // Truncate if too long
  if (featureName.length > 60) {
    featureName = featureName.slice(0, 57) + '...';
  }
  
  const description = userInput;

  // Detect feature purpose from input
  const isTracker = lowerInput.includes('track') || lowerInput.includes('tracker') || lowerInput.includes('log') || lowerInput.includes('monitor');
  const isAnalytics = lowerInput.includes('analytics') || lowerInput.includes('dashboard') || lowerInput.includes('report') || lowerInput.includes('insight') || lowerInput.includes('analyze');
  const isDecision = lowerInput.includes('decision') || lowerInput.includes('decide') || lowerInput.includes('choice') || lowerInput.includes('compare');
  const isPlanner = lowerInput.includes('plan') || lowerInput.includes('schedule') || lowerInput.includes('goal');
  const isKnowledge = lowerInput.includes('knowledge') || lowerInput.includes('notes') || lowerInput.includes('wiki') || lowerInput.includes('library') || lowerInput.includes('organize');

  // Data model based on intent
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

  // ✨ USE FEATURE ARCHITECT - Build sections with contextual labels
  // Instead of generic "Add Entry", "Entries", "Total Count", etc.,
  // the architect generates domain-specific labels like:
  // "Log Workout", "Workout History", "Total Workouts", "Fitness Trends", "Fitness Insights"
  const sections = buildContextualSections(
    userInput,
    isTracker,
    isAnalytics,
    isDecision,
    isPlanner
  );

  // AI capabilities based on purpose
  const aiCapabilities = [];
  if (isTracker) {
    aiCapabilities.push('highlight trends', 'detect patterns', 'suggest improvements');
  }
  if (isAnalytics) {
    aiCapabilities.push('surface insights', 'explain anomalies', 'predict trends');
  }
  if (isDecision) {
    aiCapabilities.push('compare options', 'weigh pros/cons', 'recommend choice');
  }
  if (isPlanner) {
    aiCapabilities.push('prioritize tasks', 'suggest schedule', 'identify gaps');
  }
  if (!aiCapabilities.length) {
    aiCapabilities.push('provide suggestions', 'analyze data', 'answer questions');
  }

  return {
    featureName,
    description,
    layout: 'custom',
    sections, // ✅ CONTEXTUAL sections with domain-appropriate labels
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

    // 4. Use AI-generated featurePlan directly - NO template overrides
    // The AI has determined the optimal structure; trust it completely
    const featureName = featurePlan.featureName;
    const featureDescription = featurePlan.description;
    
    console.log('[Feature Generation] Using AI-generated feature name:', featureName);
    console.log('[Feature Generation] Using AI-generated sections:', featurePlan.sections.map(s => s.component).join(', '));
    
    // 5. Create feature
    const feature = new Feature({
      pageId,
      name: featureName,
      description: featureDescription,
      type: intent.type,
      category: template.category || intent.category || 'functional',
      uiConfig: {
        layout: featurePlan.layout || 'custom',
        // NOTE: uiConfig is deprecated - frontend uses featurePlan.sections
        components: [],
        actions: []
      },
      config: {
        // Store the AI Feature Planner plan so the frontend can render dynamically
        // This is the ONLY source of truth for UI rendering
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
        type: intent.type, // Use parsed intent type
        description: featurePlan.description,
        ui: featurePlan.sections || [], // Map 'sections' from buildFeaturePlan to 'ui' in schema
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
