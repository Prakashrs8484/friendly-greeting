const { generateTitle } = require("../services/autoTitle.service");

exports.autoTitleController = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ error: "Text is required." });
    }

    const result = await generateTitle(text.trim());

    return res.status(200).json(result);

  } catch (err) {
    console.error("Auto Title Error:", err.message);
    return res.status(500).json({
      error: "Failed to generate title",
      details: err.message
    });
  }
};
