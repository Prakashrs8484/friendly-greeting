const { extractBullets } = require("../services/bulletExtractor.service");

exports.bulletExtractorController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const bullets = await extractBullets(text);
    res.status(200).json({ bullets });

  } catch (err) {
    res.status(500).json({ error: "Failed to extract bullets", details: err.message });
  }
};
