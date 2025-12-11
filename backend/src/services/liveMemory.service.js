// TEMPORARY in-memory storage (can be moved to Redis later)
const liveMemory = {}; 
// Structure:
// liveMemory[userId] = { draft: "...", updatedAt: timestamp }

exports.setLiveDraft = (userId, draft) => {
  if (!userId) return;
  liveMemory[userId] = {
    draft,
    updatedAt: Date.now()
  };
};

exports.getLiveDraft = (userId) => {
  return liveMemory[userId]?.draft || "";
};

exports.clearLiveDraft = (userId) => {
  delete liveMemory[userId];
};
