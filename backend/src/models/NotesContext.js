const mongoose = require('mongoose');
module.exports = mongoose.model('NotesContext', new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  notesIndex: { type: Array, default: [] }, // metadata for quick search
  lockedSections: { type: Array, default: [] },
  insights: { type: Object, default: {} },
  lastUpdated: { type: Date, default: Date.now }
}));
