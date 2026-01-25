const BaseAgent = require('./baseAgent');
const FinancialContext = require('../modules/finance/models/FinancialContext');

/**
 * Finance Agent - Handles AI reasoning and prompts for finance module
 */
class FinanceAgent extends BaseAgent {
  constructor() {
    super({ model: 'llama-3.3-70b-versatile', temperature: 0.4 });
  }

  /**
   * Chat with finance context
   * @param {string} userId - User ID
   * @param {string} message - User message
   * @returns {Promise<string>} - AI reply
   */
  async chat(userId, message) {
    const context = await FinancialContext.findOne({ userId });

    const systemPrompt = `
You are NeuraDesk's Finance Agent. Use this financial context to answer:
${JSON.stringify(context || {}, null, 2)}
    `;

    return await this.callLLM(systemPrompt, message);
  }

  /**
   * Generate finance insights with actions
   * Uses the aiInsight service logic but could be refactored here
   */
  async generateInsights(context) {
    const prompt = `
You are NeuraDesk's Autonomous Finance Agent.

Your job:
1. Analyze the user's finance data.
2. Produce a short summary ("reply").
3. Propose actionable recommendations ("actions").

Return ONLY a JSON object like this:

{
  "reply": "summary here",
  "actions": [
    {
      "id": "random-uuid",
      "type": "adjust_budget" | "rebalance_investment" | "create_goal" | "flag_overspend" | "notify_user",
      "confidence": 0.0-1.0,
      "description": "Why this action is recommended",
      "payload": {}
    }
  ]
}

### USER CONTEXT ###
${JSON.stringify(context, null, 2)}
`;

    const response = await this.callLLM(prompt, '', { temperature: 0.4 });
    
    try {
      return JSON.parse(response);
    } catch (err) {
      console.log("JSON parse error:", err.message);
      return { reply: response, actions: [] };
    }
  }
}

module.exports = new FinanceAgent();

