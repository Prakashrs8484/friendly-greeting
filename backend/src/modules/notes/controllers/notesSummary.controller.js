const { summarizeNote } = require("../services/notesSummary.service");

exports.summarizeNoteController = async (req, res) => {
  try {
    const { text, noteId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Text is required." });
    }

    const summary = await summarizeNote(text.trim());

    // Optional: Save summary to DB
    if (noteId) {
      try {
        await Note.findByIdAndUpdate(noteId, { summary }, { new: true });
      } catch (dbErr) {
        console.log("DB update failed (summary):", dbErr.message);
      }
    }

    return res.status(200).json({ summary });

  } catch (err) {
    console.error("Summary Error:", err.message || err);
    return res.status(500).json({
      error: "Failed to summarize note",
      details: err.message
    });
  }
};
