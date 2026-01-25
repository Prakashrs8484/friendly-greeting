const { buildScene } = require("../services/sceneBuilder.service");

exports.sceneBuilderController = async (req, res) => {
  try {
    const { location, mood } = req.body;

    if (!location || !mood) {
      return res.status(400).json({
        error: "Both 'location' and 'mood' are required."
      });
    }

    const scene = await buildScene(location.trim(), mood.trim());

    return res.status(200).json({ scene });

  } catch (err) {
    console.error("Scene Builder Error:", err);
    return res.status(500).json({
      error: "Failed to generate scene",
      details: err.message
    });
  }
};
