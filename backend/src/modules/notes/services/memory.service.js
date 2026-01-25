const Memory = require("../models/memory.model");
const memoryService = require("./memory.service");
/**
 * Save a memory entry
 * @param {Object} opts - { type, title, content, excerpt, metadata }
 */
exports.saveMemory = async (opts) => {
  const { type, title = "", content, excerpt = "", metadata = {} } = opts;

  if (!type || !content) {
    throw new Error("Memory requires both 'type' and 'content'");
  }

  const mem = new Memory({
    type,
    title,
    content,
    excerpt,
    metadata
  });

  return await mem.save();
  await memoryService.saveMemory({
    type: "note",
    title: note.title,
    content: note.content,
    excerpt: note.content.slice(0, 200),
    metadata: {
      noteId: note._id.toString(),
      category: note.category,
      userId: req.user?._id
    }
  });
  
};

/**
 * Search memories using MongoDB text index
 * @param {String} query
 * @param {Number} limit
 * @param {Object} filters
 */
exports.searchMemories = async (query, limit = 5, filters = {}) => {
  if (!query || !query.trim()) return [];

  const mongoQuery = {
    $text: { $search: query },
    ...filters
  };

  const results = await Memory.find(
    mongoQuery,
    { score: { $meta: "textScore" } }
  )
    .sort({ score: { $meta: "textScore" }, createdAt: -1 })
    .limit(limit)
    .lean();

  return results;
};

/**
 * Get recent memories
 * @param {Number} limit
 * @param {Object} filters
 */
exports.getRecentMemories = async (limit = 10, filters = {}) => {
  return await Memory.find(filters)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

/**
 * Delete memory by ID (optional helper)
 */
exports.deleteMemory = async (id) => {
  return await Memory.findByIdAndDelete(id);
};
exports.deleteMemoriesByNoteId = async (noteId) => {
  return await Memory.deleteMany({ "metadata.noteId": noteId.toString() });
};

/**
 * Clear all memories for a specific user (optional)
 */
exports.clearUserMemories = async (userId) => {
  return await Memory.deleteMany({ "metadata.userId": userId });
};
