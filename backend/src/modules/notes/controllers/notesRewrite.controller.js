const { rewriteNote } = require("../services/notesRewrite.service");

exports.rewriteNoteController = async (req, res) => {
  try {
    const { text, mode } = req.body;

    if (!text?.trim() || !mode) {
      return res.status(400).json({
        error: "Both 'text' and 'mode' are required."
      });
    }

    const rewritten = await rewriteNote(text.trim(), mode);

    return res.status(200).json({ rewritten });

  } catch (err) {
    console.error("Rewrite Error:", err);
    return res.status(500).json({
      error: "Failed to rewrite text",
      details: err.message || err
    });
  }
};
