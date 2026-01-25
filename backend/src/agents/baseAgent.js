const groq = require('../modules/system/services/groq.service');
const memoryService = require('../modules/system/services/memory.service');

/**
 * Base Agent class for shared LLM, RAG, and vector memory logic
 * All module-specific agents should extend or use this base functionality
 */
class BaseAgent {
  constructor(config = {}) {
    this.model = config.model || 'llama-3.3-70b-versatile';
    this.temperature = config.temperature || 0.4;
    this.groq = groq;
  }

  /**
   * Call Groq LLM with system and user messages
   * @param {string} systemPrompt - System instruction
   * @param {string} userMessage - User query
   * @param {object} options - Additional options (temperature, model override)
   * @returns {Promise<string>} - LLM response
   */
  async callLLM(systemPrompt, userMessage, options = {}) {
    try {
      const result = await this.groq.chat.completions.create({
        model: options.model || this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: options.temperature !== undefined ? options.temperature : this.temperature
      });

      return result.choices?.[0]?.message?.content || '';
    } catch (err) {
      console.log("Groq Call Error:", err.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Search vector memory using RAG
   * @param {string} query - Search query
   * @param {number} topK - Number of results
   * @param {object} filters - MongoDB filters (namespace, type, userId, etc.)
   * @returns {Promise<Array>} - Relevant memories
   */
  async searchMemory(query, topK = 5, filters = {}) {
    return await memoryService.searchMemories(query, topK, filters);
  }

  /**
   * Get recent memories
   * @param {number} limit - Number of results
   * @param {object} filters - MongoDB filters
   * @returns {Promise<Array>} - Recent memories
   */
  async getRecentMemories(limit = 10, filters = {}) {
    return await memoryService.getRecentMemories(limit, filters);
  }

  /**
   * Save a memory entry
   * @param {object} memoryData - { type, title, content, excerpt, metadata }
   * @returns {Promise<Object>} - Saved memory
   */
  async saveMemory(memoryData) {
    return await memoryService.saveMemory(memoryData);
  }

  /**
   * Build a prompt with context from vector memory
   * @param {object} params - { userId, query, topK, memoryTypes, namespace }
   * @returns {Promise<object>} - { promptText, usedMemories }
   */
  async buildPromptWithContext({ userId, query, topK = 5, memoryTypes = [], namespace = null }) {
    const filters = {};
    if (memoryTypes.length) filters.type = { $in: memoryTypes };
    if (namespace) filters['metadata.namespace'] = namespace;
    if (userId) filters['metadata.userId'] = userId;

    const memories = await this.searchMemory(query, topK, filters);

    const memoryBlock = memories.length
      ? `\n### Relevant Context\n${memories
          .map((m, i) => `${i + 1}. ${m.title || 'Untitled'}\n${m.excerpt || m.content.slice(0, 300)}\n`)
          .join('\n')}`
      : '\n### Relevant Context\n(No relevant context found)\n';

    return {
      promptText: `${query}\n${memoryBlock}`,
      usedMemories: memories
    };
  }
}

module.exports = BaseAgent;

