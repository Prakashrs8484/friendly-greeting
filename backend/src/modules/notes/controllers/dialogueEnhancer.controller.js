const { enhanceDialogue } = require("../services/dialogueEnhancer.service");

exports.dialogueEnhancerController = async (req, res) => {
  try {
    const { text, style } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Dialogue text is required." });
    }

    const enhanced = await enhanceDialogue(text.trim(), style);

    return res.status(200).json({ enhanced });

  } catch (err) {
    console.error("Dialogue Enhancer Error:", err);
    return res.status(500).json({
      error: "Failed to enhance dialogue",
      details: err.message
    });
  }
};
