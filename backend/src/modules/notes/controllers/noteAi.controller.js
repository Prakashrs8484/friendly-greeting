const { correctNote, paraphraseNote } = require("../services/noteAi.service");
const Note = require("../models/Note");

// Improve grammar + punctuation
exports.improveNote = async (req, res) => {
  try {
    const { noteId, text } = req.body;

    if (!text) return res.status(400).json({ error: "Text is required" });

    const improvedText = await correctNote(text);

    // Optional: update note automatically
    if (noteId) {
      await Note.findByIdAndUpdate(noteId, { content: improvedText });
    }

    return res.json({ improved: improvedText });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Paraphrasing endpoint
exports.paraphraseNoteController = async (req, res) => {
  try {
    const { noteId, text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text is required and must be a non-empty string." });
    }

    // call AI paraphrase service
    const paraphrased = await paraphraseNote(text.trim());

    // Optionally update DB
    if (noteId) {
      try {
        await Note.findByIdAndUpdate(noteId, { content: paraphrased }, { new: true });
      } catch (dbErr) {
        console.error("DB update (paraphraseNoteController) failed:", dbErr);
        // don't fail the whole request if DB update fails
      }
    }

    // Return a clear key 'paraphrased' so frontend knows what to expect
    return res.status(200).json({ paraphrased });
  } catch (err) {
    console.error("paraphraseNoteController error:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: "Failed to paraphrase note", details: err.message || err });
  }
};
