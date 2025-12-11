const Note = require("../models/Note");
const { summarizeNote, analyzeEmotion, embedNote } = require("../services/notes.service");
const memoryService = require("../services/memory.service");


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

    await memoryService.saveMemory({
      type: "note",
      title: note.title,
      content: note.content,
      excerpt: note.content.slice(0, 200),
      metadata: {
        noteId: note._id,
        category: note.category,
        userId: req.user?._id
      }
    });


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
    const noteId = req.params.id;
    const userId = req.user?._id;
    console.log("========== GET NOTE BY ID ==========");
    console.log("Request received:", { noteId, userId });
    
    const note = await Note.findOne({ _id: noteId, userId: userId });
    
    if (!note) {
      console.log("Note not found:", { noteId, userId });
      console.log("======================================");
      return res.status(404).json({ message: "Note not found" });
    }
    
    console.log("Note found successfully:", { noteId, title: note.title });
    console.log("======================================");
    res.json(note);
  } catch (err) {
    console.error("========== GET NOTE BY ID ERROR ==========");
    console.error("Error Message:", err.message);
    console.error("Error Name:", err.name);
    console.error("Error Stack:", err.stack);
    console.error("Request params:", { noteId: req.params.id, userId: req.user?._id });
    console.error("======================================");
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
    await memoryService.saveMemory({
      type: "note",
      title: note.title,
      content: note.content,
      excerpt: note.content.slice(0, 200),
      metadata: {
        noteId: note._id,
        category: note.category,
        userId: req.user?._id
      }
    });
    res.json(note);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete note

exports.deleteNoteController = async (req, res) => {
  try {
    const noteId = req.params.id;

    // delete note from DB
    const deleted = await Note.findByIdAndDelete(noteId);

    if (!deleted) {
      return res.status(404).json({ error: "Note not found" });
    }

    // delete associated memories
    await memoryService.deleteMemoriesByNoteId(noteId);

    return res.status(200).json({ success: true, message: "Note and memories removed" });

  } catch (err) {
    console.error("Delete note error:", err);
    return res.status(500).json({ error: "Failed to delete note" });
  }
};


