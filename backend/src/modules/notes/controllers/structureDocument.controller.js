const { structureDocument } = require("../services/structureDocument.service");

exports.structureDocumentController = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "Text is required" });

    const structured = await structureDocument(text);
    return res.status(200).json({ structured });

  } catch (err) {
    return res.status(500).json({ error: "Failed to structure document", details: err.message });
  }
};

