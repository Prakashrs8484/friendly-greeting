const BaseAgent = require('./baseAgent');
const HealthContext = require('../modules/health/models/HealthContext');

/**
 * Health Agent - Handles AI reasoning and prompts for health module
 */
class HealthAgent extends BaseAgent {
  constructor() {
    super({ model: 'llama-3.3-70b-versatile', temperature: 0.4 });
  }

  /**
   * Chat with health context
   * @param {string} userId - User ID
   * @param {string} message - User message
   * @returns {Promise<string>} - AI reply
   */
  async chat(userId, message) {
    const context = await HealthContext.findOne({ userId });

    const systemPrompt = `
You are NeuraDesk Health Agent. Use context:
${JSON.stringify(context || {}, null, 2)}
    `;

    return await this.callLLM(systemPrompt, message);
  }
}

module.exports = new HealthAgent();

