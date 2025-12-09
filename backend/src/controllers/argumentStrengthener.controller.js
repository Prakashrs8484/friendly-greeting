const strengthenArgument = require("../services/argumentStrengthener.service");
exports.argumentStrengthenerController = async (req, res) => {
    try {
      const { text } = req.body;
  
      const strengthened = await strengthenArgument(text);
      res.status(200).json({ strengthened });
  
    } catch (err) {
      res.status(500).json({ error: "Failed to strengthen argument", details: err.message });
    }
  };
  