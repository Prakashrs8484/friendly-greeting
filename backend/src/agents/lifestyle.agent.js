const BaseAgent = require('./baseAgent');
const LifestyleContext = require('../modules/lifestyle/models/LifestyleContext');

/**
 * Lifestyle Agent - Handles AI reasoning and prompts for lifestyle module
 */
class LifestyleAgent extends BaseAgent {
  constructor() {
    super({ model: 'llama-3.3-70b-versatile', temperature: 0.4 });
  }

  /**
   * Chat with lifestyle context
   * @param {string} userId - User ID
   * @param {string} message - User message
   * @returns {Promise<string>} - AI reply
   */
  async chat(userId, message) {
    const context = await LifestyleContext.findOne({ userId });

    const systemPrompt = `
You are NeuraDesk Lifestyle Agent. Use context:
${JSON.stringify(context || {}, null, 2)}
    `;

    return await this.callLLM(systemPrompt, message);
  }
}

module.exports = new LifestyleAgent();

