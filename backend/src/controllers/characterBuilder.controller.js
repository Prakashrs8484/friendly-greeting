const { buildCharacter } = require("../services/characterBuilder.service");

exports.characterBuilderController = async (req, res) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Character description is required." });
    }

    const character = await buildCharacter(description.trim());

    return res.status(200).json({ character });

  } catch (err) {
    console.error("Character Builder Error:", err.message || err);
    return res.status(500).json({
      error: "Failed to generate character",
      details: err.message
    });
  }
};
