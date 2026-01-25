const { academicImprove } = require("../services/academicImprove.service");

exports.academicImproveController = async (req, res) => {
  try {
    const { text } = req.body;

    const improved = await academicImprove(text);

    return res.status(200).json({ improved });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to improve text academically",
      details: err.message
    });
  }
};
