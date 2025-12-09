const academicImprove = require("../services/academinImprove.service");
exports.academicImproveController = async (req, res) => {
    try {
      const { text } = req.body;
  
      const improved = await academicImprove(text);
      res.status(200).json({ improved });
  
    } catch (err) {
      res.status(500).json({ error: "Failed to improve text academically", details: err.message });
    }
  };
  