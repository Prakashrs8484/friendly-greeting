const { expandIdea } = require("../services/notesExpand.service");

exports.expandIdeaController = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required." });
    }

    const expanded = await expandIdea(text.trim());

    return res.status(200).json({ expanded });

  } catch (err) {
    console.error("Expand Idea Error:", err);
    return res.status(500).json({
      error: "Failed to expand idea",
      details: err.message
    });
  }
};
