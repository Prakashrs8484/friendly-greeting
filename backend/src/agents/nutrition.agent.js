const BaseAgent = require('./baseAgent');
const NutritionContext = require('../modules/nutrition/models/NutritionContext');

/**
 * Nutrition Agent - Handles AI reasoning and prompts for nutrition module
 */
class NutritionAgent extends BaseAgent {
  constructor() {
    super({ model: 'llama-3.3-70b-versatile', temperature: 0.4 });
  }

  /**
   * Chat with nutrition context
   * @param {string} userId - User ID
   * @param {string} message - User message
   * @returns {Promise<string>} - AI reply
   */
  async chat(userId, message) {
    const context = await NutritionContext.findOne({ userId });

    const systemPrompt = `
You are NeuraDesk Nutrition Agent. Use context:
${JSON.stringify(context || {}, null, 2)}
    `;

    return await this.callLLM(systemPrompt, message);
  }
}

module.exports = new NutritionAgent();

