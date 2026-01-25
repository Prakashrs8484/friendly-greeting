const Memory = require('../modules/system/models/memory.model');

/**
 * Centralized vector/memory service with namespace support per module
 * Namespaces: finance, notes, nutrition, health, lifestyle
 */

/**
 * Save a memory entry with optional namespace
 * @param {Object} opts - { type, title, content, excerpt, metadata, namespace }
 */
exports.saveMemory = async (opts) => {
  const { type, title = '', content, excerpt = '', metadata = {}, namespace } = opts;

  if (!type || !content) {
    throw new Error("Memory requires both 'type' and 'content'");
  }

  // Add namespace to metadata if provided
  const enrichedMetadata = namespace ? { ...metadata, namespace } : metadata;

  const mem = new Memory({
    type,
    title,
    content,
    excerpt,
    metadata: enrichedMetadata
  });

  return await mem.save();
};

/**
 * Search memories using MongoDB text index with namespace filtering
 * @param {String} query
 * @param {Number} limit
 * @param {Object} filters - Can include namespace, type, userId, etc.
 */
exports.searchMemories = async (query, limit = 5, filters = {}) => {
  if (!query || !query.trim()) return [];

  const mongoQuery = {
    $text: { $search: query },
    ...filters
  };

  const results = await Memory.find(
    mongoQuery,
    { score: { $meta: 'textScore' } }
  )
    .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
    .limit(limit)
    .lean();

  return results;
};

/**
 * Get recent memories with optional namespace filtering
 * @param {Number} limit
 * @param {Object} filters - Can include namespace, type, userId, etc.
 */
exports.getRecentMemories = async (limit = 10, filters = {}) => {
  return await Memory.find(filters)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Delete memory by ID
 */
exports.deleteMemory = async (id) => {
  return await Memory.findByIdAndDelete(id);
};

/**
 * Delete memories by noteId (for notes module)
 */
exports.deleteMemoriesByNoteId = async (noteId) => {
  return await Memory.deleteMany({ 'metadata.noteId': noteId.toString() });
};

/**
 * Clear all memories for a specific user
 */
exports.clearUserMemories = async (userId) => {
  return await Memory.deleteMany({ 'metadata.userId': userId });
};

/**
 * Clear memories by namespace
 */
exports.clearNamespaceMemories = async (namespace) => {
  return await Memory.deleteMany({ 'metadata.namespace': namespace });
};

