const Message = require('../models/message.model');

/**
 * Save a message (chat or feature summary)
 * - Chat: user and agent messages stored with pageId + agentId (selected agent)
 * - Page-level: feature summaries etc. stored with agentId = null
 * @param {string} pageId - The Agent Page ID
 * @param {string|null} agentId - The Agent ID (null for page-level entries only)
 * @param {string} role - 'user' or 'agent'
 * @param {string} content - Message content
 * @param {string} source - 'chat' or 'feature' (default 'chat')
 * @param {string|null} featureId - Optional feature linkage for feature-related messages
 * @returns {Promise<Object>} Saved message
 */
const saveMessage = async (pageId, agentId, role, content, source = 'chat', featureId = null) => {
  console.log('[Message Service] [DB WRITE] Saving message:', {
    pageId,
    agentId: agentId || 'null (page-level)',
    featureId: featureId || 'null',
    role,
    source,
    contentLength: content.length
  });
  
  const message = new Message({
    pageId,
    agentId: agentId || null,
    featureId: featureId || null,
    role,
    content,
    source,
    createdAt: new Date()
  });
  
  const saved = await message.save();
  console.log('[Message Service] [DB WRITE] Message saved:', saved._id);
  return saved;
};

/**
 * Get agent-specific chat history (last N messages for this page + agent thread)
 * Used to load context for executeAgent and for frontend per-agent thread.
 * @param {string} pageId - The Agent Page ID
 * @param {string} agentId - The Agent ID
 * @param {number} limit - Maximum number of messages (default: 20)
 * @returns {Promise<Array>} Messages in chronological order (oldest to newest)
 */
const getAgentHistory = async (pageId, agentId, limit = 20) => {
  console.log('[Message Service] [DB READ] Loading agent history:', { pageId, agentId, limit });
  const messages = await Message.find({ pageId, agentId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
  console.log('[Message Service] [DB READ] Loaded', messages.length, 'messages for agent', agentId);
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    createdAt: msg.createdAt
  }));
};

/**
 * Get page-level context (agentId = null): feature summaries, etc.
 * @param {string} pageId - The Agent Page ID
 * @param {number} limit - Maximum number of entries (default: 10)
 * @returns {Promise<Array>} Page-level messages in chronological order
 */
const getPageLevelContext = async (pageId, limit = 10) => {
  console.log('[Message Service] [DB READ] Loading page-level context:', { pageId, limit });
  const messages = await Message.find({ pageId, agentId: null })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  console.log('[Message Service] [DB READ] Loaded', messages.length, 'page-level messages');
  return messages.map(msg => ({
    role: msg.role,
    content: msg.content,
    source: msg.source,
    createdAt: msg.createdAt
  }));
};

/**
 * Get messages for a single agent's thread (for frontend display)
 * When switching agents, frontend loads only this agent's history.
 * @param {string} pageId - The Agent Page ID
 * @param {string} agentId - The Agent ID (required)
 * @param {number} limit - Maximum number of messages (default: 50)
 * @returns {Promise<Array>} Array of messages
 */
const getMessagesForAgent = async (pageId, agentId, limit = 50) => {
  console.log('[Message Service] [DB READ] Loading messages for agent thread:', { pageId, agentId, limit });
  const messages = await Message.find({ pageId, agentId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
  console.log('[Message Service] [DB READ] Loaded', messages.length, 'messages for agent', agentId);
  return messages.map(msg => ({
    _id: msg._id,
    pageId: msg.pageId.toString(),
    agentId: msg.agentId ? msg.agentId.toString() : null,
    role: msg.role,
    content: msg.content,
    source: msg.source || 'chat',
    createdAt: msg.createdAt
  }));
};

/** @deprecated Use getMessagesForAgent for per-agent thread. Kept for backward compat. */
const getPageMessages = async (pageId, limit = 50) => {
  const messages = await Message.find({ pageId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
  return messages.map(msg => ({
    _id: msg._id,
    pageId: msg.pageId.toString(),
    agentId: msg.agentId ? msg.agentId.toString() : null,
    role: msg.role,
    content: msg.content,
    source: msg.source || 'chat',
    createdAt: msg.createdAt
  }));
};

/**
 * Delete all messages for a page (cleanup utility)
 * @param {string} pageId - The Agent Page ID
 * @returns {Promise<Object>} Deletion result
 */
const deletePageMessages = async (pageId) => {
  return await Message.deleteMany({ pageId });
};

module.exports = {
  saveMessage,
  getAgentHistory,
  getPageLevelContext,
  getMessagesForAgent,
  getPageMessages,
  deletePageMessages
};
