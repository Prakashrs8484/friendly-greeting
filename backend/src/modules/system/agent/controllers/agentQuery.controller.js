const agentQueryService = require("../services/agentQuery.service");
const memoryService = require("../../../../vector/memory.service");

/**
 * POST /api/agent/query
 * body: { query: string, topK?: number, memoryTypes?: string[], saveReply?: boolean }
 */
exports.agentQueryController = async (req, res) => {
  try {
    const userId = req.user?.id || (req.body.userId) || null; // prefer req.user from auth middleware
    const { query, topK = 5, memoryTypes = [], saveReply = false } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: "query is required" });
    }

    const result = await agentQueryService.runAgentQuery({
      userId,
      query,
      topK: Number(topK),
      memoryTypes,
      saveReply: Boolean(saveReply)
    });

    return res.status(200).json({
      reply: result.reply,
      usedMemories: result.usedMemories,
      savedMemory: result.savedMemory ? { id: result.savedMemory._id } : null
    });
  } catch (err) {
    console.error("agentQueryController error:", err);
    return res.status(500).json({ error: "Agent query failed", details: err.message });
  }
};

/**
 * GET /api/agent/memories?type=note
 * Query params: type (optional)
 */
exports.getMemoriesController = async (req, res) => {
  try {
    const type = req.query.type;
    const userId = req.user?._id;
    const limit = parseInt(req.query.limit) || 100;
    
    console.log("========== GET MEMORIES ==========");
    console.log("Request received:", { type, userId, limit });
    
    const filters = {};
    if (type) {
      filters.type = type;
    }
    if (userId) {
      filters["metadata.userId"] = userId;
    }
    
    console.log("Filters applied:", filters);
    
    const memories = await memoryService.getRecentMemories(limit, filters);
    
    console.log("Memories found:", memories.length);
    console.log("======================================");
    
    return res.status(200).json({ memories, count: memories.length });
  } catch (err) {
    console.error("========== GET MEMORIES ERROR ==========");
    console.error("Error Message:", err.message);
    console.error("Error Name:", err.name);
    console.error("Error Stack:", err.stack);
    console.error("Request query:", req.query);
    console.error("User ID:", req.user?._id);
    console.error("======================================");
    return res.status(500).json({ error: "Failed to fetch memories", details: err.message });
  }
};
