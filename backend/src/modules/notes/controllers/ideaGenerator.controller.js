const { generateIdeas } = require("../services/ideaGenerator.service");

exports.ideaGeneratorController = async (req, res) => {
  try {
    const { mode, topic } = req.body;

    if (!mode) {
      return res.status(400).json({ error: "'mode' is required." });
    }

    const ideas = await generateIdeas(mode, topic);

    return res.status(200).json({ ideas });

  } catch (err) {
    console.error("Idea Generator Error:", err);
    return res.status(500).json({
      error: "Failed to generate ideas",
      details: err.message
    });
  }
};
