const { generateOutline } = require("../services/outlineGenerator.service");

exports.outlineGeneratorController = async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({ error: "Topic is required." });
    }

    const outline = await generateOutline(topic.trim());

    return res.status(200).json({ outline });

  } catch (err) {
    console.error("Outline Generator Error:", err.message);
    return res.status(500).json({
      error: "Failed to generate outline",
      details: err.message
    });
  }
};
