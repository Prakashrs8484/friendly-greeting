const BaseAgent = require('./baseAgent');
const NotesContext = require('../modules/notes/models/NotesContext');

/**
 * Notes Agent - Handles AI reasoning and prompts for notes module
 */
class NotesAgent extends BaseAgent {
  constructor() {
    super({ model: 'llama-3.3-70b-versatile', temperature: 0.6 });
  }

  /**
   * Chat with notes context
   * @param {string} userId - User ID
   * @param {string} message - User message
   * @returns {Promise<string>} - AI reply
   */
  async chat(userId, message) {
    const context = await NotesContext.findOne({ userId });

    const systemPrompt = `
You are NeuraDesk Notes Agent. Use context:
${JSON.stringify(context || {}, null, 2)}
    `;

    return await this.callLLM(systemPrompt, message);
  }

  /**
   * Build prompt with notes-specific memory context
   * Uses namespace "notes" for vector memory filtering
   */
  async buildPromptWithNotesContext({ userId, query, topK = 5, memoryTypes = [] }) {
    return await this.buildPromptWithContext({
      userId,
      query,
      topK,
      memoryTypes: memoryTypes.length ? memoryTypes : ['note'],
      namespace: 'notes'
    });
  }
}

module.exports = new NotesAgent();

