const { generateTags } = require("../services/autoTags.service");

exports.autoTagsController = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: "Text is required." });
    }

    const result = await generateTags(text.trim());

    return res.status(200).json(result);

  } catch (err) {
    console.error("Auto Tags Error:", err);
    return res.status(500).json({
      error: "Failed to generate tags",
      details: err.message
    });
  }
};
