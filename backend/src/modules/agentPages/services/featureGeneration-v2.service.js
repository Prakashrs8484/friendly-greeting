const Feature = require('../models/feature.model');
const { generateFeatureSchema } = require('./featureArchitectAgent.service');
const { addAgent } = require('./agentPage.service');

/**
 * Schema-Driven Feature Generation Service
 * 
 * Generates features using FeatureArchitectAgent LLM.
 * No templates, no type registry, no fallbacks.
 * Pure schema-driven architecture.
 */

/**
 * Generate a feature from natural language input
 * @param {string} pageId - The Agent Page ID
 * @param {string} ownerId - The owner's user ID
 * @param {string} userInput - Natural language description of the feature
 * @returns {Promise<Object>} Created feature with complete schema
 */
async function generateFeature(pageId, ownerId, userInput) {
  try {
    console.log('[Feature Generation] Starting feature generation:', { pageId, userInput: userInput.substring(0, 100) });

    // 1. Generate complete schema using FeatureArchitectAgent LLM
    const pageBlueprint = await generateFeatureSchema(userInput);
    console.log('[Feature Generation] Generated pageBlueprint:', pageBlueprint);

    // 2. Create feature with schema
    const feature = new Feature({
      pageId,
      name: pageBlueprint.featureName,
      description: pageBlueprint.description,
      pageBlueprint,
      category: 'functional',
      originalInput: userInput,
      agentIds: []
    });

    // 3. Save feature
    const savedFeature = await feature.save();
    console.log('[Feature Generation] Feature saved:', { featureId: savedFeature._id, name: savedFeature.name });

    // Note: Agent creation is now optional and can be triggered separately
    // Features don't require agents to function with the schema-driven renderer

    return {
      success: true,
      feature: savedFeature,
      message: `Feature "${pageBlueprint.featureName}" created successfully`
    };
  } catch (error) {
    console.error('[Feature Generation] Error generating feature:', error);
    throw error;
  }
}

/**
 * Create a feature directly from an approved plan/blueprint
 * @param {string} pageId
 * @param {string} ownerId
 * @param {Object} plan
 * @returns {Promise<Object>}
 */
async function createFeatureFromPlan(pageId, ownerId, plan) {
  try {
    const featureName = String(plan?.featureName || 'Custom Feature').trim();
    const description = String(plan?.description || '').trim();
    const layout = plan?.layout && typeof plan.layout === 'object'
      ? plan.layout
      : { type: 'vertical' };
    const sections = Array.isArray(plan?.sections) ? plan.sections : [];
    const dataModel = Array.isArray(plan?.dataModel) ? plan.dataModel : [];
    const aiCapabilities = Array.isArray(plan?.aiCapabilities) ? plan.aiCapabilities : [];

    if (!featureName) {
      throw new Error('featureName is required for plan materialization');
    }

    if (sections.length === 0) {
      throw new Error('sections are required for plan materialization');
    }

    const pageBlueprint = {
      featureName,
      description,
      layout,
      sections,
      dataModel,
      aiCapabilities,
    };

    const feature = new Feature({
      pageId,
      name: featureName,
      description,
      pageBlueprint,
      category: 'functional',
      originalInput: String(plan?.originalInput || featureName),
      agentIds: []
    });

    const savedFeature = await feature.save();

    return {
      success: true,
      feature: savedFeature,
      message: `Feature "${featureName}" materialized from approved plan`
    };
  } catch (error) {
    console.error('[Feature Generation] Error creating feature from plan:', error);
    throw error;
  }
}

/**
 * Create AI agents for a feature (optional)
 * @param {string} featureId - The Feature ID
 * @param {string} pageId - The Agent Page ID
 * @param {string} ownerId - The owner's user ID
 * @param {Object} pageBlueprint - The feature's schema
 * @returns {Promise<Array>} Created agents
 */
async function createAgentsForFeature(featureId, pageId, ownerId, pageBlueprint) {
  try {
    console.log('[Feature Generation] Creating agents for feature:', featureId);
    const createdAgents = [];

    // Default agents for any feature with aiCapabilities
    if (pageBlueprint.aiCapabilities && pageBlueprint.aiCapabilities.length > 0) {
      const insightAgent = {
        name: `${pageBlueprint.featureName} Insights`,
        description: `Provides AI-powered insights for ${pageBlueprint.featureName}`,
        config: {
          role: 'Data Analyst',
          tone: 'Helpful',
          creativity: 60,
          verbosity: 70,
          memoryEnabled: true,
          capabilities: pageBlueprint.aiCapabilities
        }
      };

      try {
        const agent = await addAgent(pageId, ownerId, insightAgent);
        createdAgents.push(agent);

        // Update feature with agent IDs
        const Feature = require('../models/feature.model');
        await Feature.findByIdAndUpdate(featureId, { agentIds: [agent._id] });

        console.log('[Feature Generation] Created agent:', agent.name);
      } catch (agentError) {
        console.warn('[Feature Generation] Could not create agent:', agentError.message);
        // Feature still works without agents
      }
    }

    return createdAgents;
  } catch (error) {
    console.error('[Feature Generation] Error creating agents:', error);
    // Don't throw - agents are optional
    return [];
  }
}

/**
 * Get a feature with its full schema
 * @param {string} featureId - The Feature ID
 * @returns {Promise<Object>} Feature with pageBlueprint
 */
async function getFeature(featureId) {
  try {
    const feature = await Feature.findById(featureId).populate('agentIds');
    if (!feature) {
      throw new Error('Feature not found');
    }
    return feature;
  } catch (error) {
    console.error('[Feature Generation] Error getting feature:', error);
    throw error;
  }
}

/**
 * Get all features for a page
 * @param {string} pageId - The Agent Page ID
 * @returns {Promise<Array>} Features with their schemas
 */
async function getPageFeatures(pageId) {
  try {
    const features = await Feature.find({ pageId }).populate('agentIds');
    return features;
  } catch (error) {
    console.error('[Feature Generation] Error getting features:', error);
    throw error;
  }
}

/**
 * Delete a feature with full cascade cleanup
 * Removes: feature, feature data, feature plan, feature-linked messages, and feature-bound agents
 * @param {string} featureId - The Feature ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteFeature(featureId) {
  try {
    const FeatureData = require('../models/featureData.model');
    const FeaturePlan = require('../models/featurePlan.model');
    const Message = require('../models/message.model');
    const Agent = require('../models/agent.model');

    // 1. Find the feature to get pageId and agentIds
    const feature = await Feature.findById(featureId);
    if (!feature) {
      throw new Error('Feature not found');
    }

    // 2. Delete FeatureData for this feature
    await FeatureData.deleteMany({ featureId });

    // 3. Delete FeaturePlan for this feature
    await FeaturePlan.deleteMany({ featureId });

    // 4. Delete Messages linked to this feature (summaries, events, insights)
    await Message.deleteMany({ featureId });

    // 5. Delete Agents that are bound only to this feature
    if (feature.agentIds && feature.agentIds.length > 0) {
      // For now, delete all feature-bound agents. In future, could support multi-feature agents.
      await Agent.deleteMany({ _id: { $in: feature.agentIds } });
    }

    // 6. Delete the Feature itself
    const result = await Feature.findByIdAndDelete(featureId);
    console.log('[Feature Generation] Feature deleted with cascade:', { 
      featureId, 
      deletedFeatureData: true, 
      deletedMessages: true,
      deletedAgents: feature.agentIds?.length || 0
    });
    return result;
  } catch (error) {
    console.error('[Feature Generation] Error deleting feature:', error);
    throw error;
  }
}

module.exports = {
  generateFeature,
  createFeatureFromPlan,
  createAgentsForFeature,
  getFeature,
  getPageFeatures,
  deleteFeature
};
