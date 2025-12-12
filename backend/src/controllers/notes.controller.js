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
      console.log("❌ FAILURE: Note not found");
      console.log("Note ID:", noteId);
      console.log("User ID:", userId);
      console.log("This could mean:");
      console.log("  - Note doesn't exist");
      console.log("  - Note belongs to a different user");
      console.log("  - Invalid note ID format");
      console.log("======================================");
      return res.status(404).json({ message: "Note not found" });
    }
    
    console.log("✅ SUCCESS: Note found successfully");
    console.log("Note details:", { 
      id: note._id, 
      title: note.title, 
      category: note.category,
      createdAt: note.createdAt 
    });
    console.log("======================================");
    res.json(note);
  } catch (err) {
    console.error("========== GET NOTE BY ID ERROR ==========");
    console.error("❌ FAILURE: Error retrieving note");
    console.error("Error Message:", err.message);
    console.error("Error Name:", err.name);
    console.error("Error Stack:", err.stack);
    console.error("Request params:", { noteId: req.params.id, userId: req.user?._id });
    console.error("Full Error Object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
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
    const userId = req.user?._id;
    
    console.log("========== DELETE NOTE ==========");
    console.log("Request received:", { noteId, userId });
    
    // delete note from DB
    const deleted = await Note.findByIdAndDelete(noteId);
    
    if (!deleted) {
      console.log("❌ FAILURE: Note not found in database");
      console.log("Note ID:", noteId);
      console.log("User ID:", userId);
      console.log("======================================");
      return res.status(404).json({ error: "Note not found" });
    }
    
    console.log("✅ SUCCESS: Note deleted from database");
    console.log("Deleted note:", { id: deleted._id, title: deleted.title });
    
    // delete associated memories
    try {
      const memoryResult = await memoryService.deleteMemoriesByNoteId(noteId);
      console.log("✅ SUCCESS: Associated memories deleted");
      console.log("Memory deletion result:", memoryResult);
    } catch (memoryErr) {
      console.error("⚠️ WARNING: Failed to delete memories, but note was deleted");
      console.error("Memory deletion error:", memoryErr.message);
    }
    
    console.log("✅ SUCCESS: Delete operation completed");
    console.log("======================================");
    return res.status(200).json({ success: true, message: "Note and memories removed" });

  } catch (err) {
    console.error("========== DELETE NOTE ERROR ==========");
    console.error("❌ FAILURE: Delete operation failed");
    console.error("Error Message:", err.message);
    console.error("Error Name:", err.name);
    console.error("Error Stack:", err.stack);
    console.error("Request params:", { noteId: req.params.id, userId: req.user?._id });
    console.error("Full Error Object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    console.error("======================================");
    return res.status(500).json({ error: "Failed to delete note", details: err.message });
  }
};


