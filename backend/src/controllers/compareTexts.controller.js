const { compareTexts } = require("../services/compareText.service");

exports.compareTextsController = async (req, res) => {
  try {
    const { textA, textB } = req.body;

    const comparison = await compareTexts(textA, textB);

    return res.status(200).json({ comparison });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to compare texts",
      details: err.message
    });
  }
};
