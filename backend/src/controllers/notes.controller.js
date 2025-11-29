const Note = require("../models/Note");
const { summarizeNote, analyzeEmotion, embedNote } = require("../services/notes.service");

// Create Note
exports.createNote = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    const note = await Note.create({
      userId: req.user._id,
      title,
      content,
      category,
      tags
    });

    // AI Summary & Emotion analysis
    note.summary = await summarizeNote(content);
    note.emotion = await analyzeEmotion(content);

    // Vector embeddings (for RAG search)
    note.embeddings = await embedNote(content);

    await note.save();

    res.status(201).json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch all notes
exports.getAllNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user._id }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Fetch single note
exports.getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: "Note not found" });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update note
exports.updateNote = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;

    let note = await Note.findOne({ _id: req.params.id, userId: req.user._id });
    if (!note) return res.status(404).json({ message: "Not found" });

    note.title = title ?? note.title;
    note.content = content ?? note.content;
    note.category = category ?? note.category;
    note.tags = tags ?? note.tags;

    // Re-run AI processing if content changed
    if (content) {
      note.summary = await summarizeNote(content);
      note.emotion = await analyzeEmotion(content);
      note.embeddings = await embedNote(content);
    }

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    await Note.deleteOne({ _id: req.params.id, userId: req.user._id });
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
