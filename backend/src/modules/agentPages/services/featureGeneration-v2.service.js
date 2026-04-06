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
 * Delete a feature
 * @param {string} featureId - The Feature ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteFeature(featureId) {
  try {
    const result = await Feature.findByIdAndDelete(featureId);
    console.log('[Feature Generation] Feature deleted:', featureId);
    return result;
  } catch (error) {
    console.error('[Feature Generation] Error deleting feature:', error);
    throw error;
  }
}

module.exports = {
  generateFeature,
  createAgentsForFeature,
  getFeature,
  getPageFeatures,
  deleteFeature
};
