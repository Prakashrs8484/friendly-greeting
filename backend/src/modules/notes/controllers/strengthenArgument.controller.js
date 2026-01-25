const { strengthenArgument } = require("../services/strengthenArgument.service");

exports.strengthenArgumentController = async (req, res) => {
  try {
    const { text } = req.body;

    const strengthened = await strengthenArgument(text);

    return res.status(200).json({ strengthened });
  } catch (err) {
    return res.status(500).json({
      error: "Failed to strengthen argument",
      details: err.message
    });
  }
};
