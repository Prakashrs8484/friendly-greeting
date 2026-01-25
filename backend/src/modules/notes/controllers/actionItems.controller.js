
const { extractActions } = require("../services/actionItems.service");

exports.actionItemsController = async (req, res) => {
  try {
    const { text } = req.body;

    const result = await extractActions(text);
    res.status(200).json(result);

  } catch (err) {
    res.status(500).json({ error: "Failed to extract action items", details: err.message });
  }
};
