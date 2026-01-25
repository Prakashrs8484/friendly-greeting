const liveMemoryService = require("../services/liveMemory.service");

exports.updateLiveDraftController = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId) 
      return res.status(401).json({ error: "Unauthorized" });

    const { text } = req.body;

    // Save into temporary memory
    liveMemoryService.setLiveDraft(userId, text || "");

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Live draft update error:", err);
    return res.status(500).json({ error: "Failed to update live draft" });
  }
};

