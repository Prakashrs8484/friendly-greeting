const { generalImprove } = require("../services/generalImprove.service");

exports.generalImproveController = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: "Text is required and must be a string" });
    }

    const improved = await generalImprove(text.trim());

    return res.status(200).json({ improved });
  } catch (err) {
    console.error("General Improve Controller Error:", err);
    return res.status(500).json({
      error: "Failed to improve text for general notes",
      details: err.message
    });
  }
};
