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

    if (!text) return res.status(400).json({ error: "Text is required" });

    const rewritten = await paraphraseNote(text);

    // Optional: update note automatically
    if (noteId) {
      await Note.findByIdAndUpdate(noteId, { content: rewritten });
    }

    return res.json({ rewritten });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
