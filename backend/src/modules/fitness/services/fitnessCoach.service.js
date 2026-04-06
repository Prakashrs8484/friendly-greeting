const { generateCoachReply: generateCoachReplyLocal } = require('../../mcp/fitness/services/fitnessCoachAnalyzer.service');
const { invokeFitnessCoachViaMcp } = require('./fitnessMcpClient.service');

const fitnessCoachService = {
  /**
   * Generate personalized AI coach reply using MCP
   * @param {array} parsedActions - Parsed fitness actions from parser
   * @param {object} dashboard - Updated dashboard payload with metrics and progress
   * @param {object} userProfile - User's fitness profile with goals
   * @returns {string} Personalized coach reply from MCP
   */
  async generateCoachReply(parsedActions, dashboard, userProfile) {
    try {
      const useMcpFitness = process.env.USE_MCP_FITNESS !== 'false';

      if (useMcpFitness) {
        try {
          const mcpResult = await invokeFitnessCoachViaMcp(
            {
              text: '',
              parsedActions: Array.isArray(parsedActions) ? parsedActions : [],
              dashboard: dashboard || {},
            },
            {
              timeoutMs: Number(process.env.FITNESS_MCP_TIMEOUT_MS) || 7000,
            }
          );

          if (mcpResult && typeof mcpResult.coachMessage === 'string' && mcpResult.coachMessage.trim()) {
            return mcpResult.coachMessage;
          }
        } catch (mcpError) {
          console.warn('[Fitness Coach] MCP call failed, using local fallback:', mcpError.message);
        }
      }

      // Local deterministic fallback
      return generateCoachReplyLocal(parsedActions, dashboard);
    } catch (error) {
      console.error('[Fitness Coach] Error generating reply:', error.message);
      // Fallback to basic message
      return 'Great job logging your activities! Keep up the momentum!';
    }
  },
};

module.exports = fitnessCoachService;
