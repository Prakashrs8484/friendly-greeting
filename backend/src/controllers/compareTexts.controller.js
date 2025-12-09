const compareTexts = require("../services/compareText.service");
exports.compareTextsController = async (req, res) => {
    try {
      const { textA, textB } = req.body;
  
      const result = await compareTexts(textA, textB);
      res.status(200).json(result);
  
    } catch (err) {
      res.status(500).json({ error: "Failed to compare texts", details: err.message });
    }
  };
  