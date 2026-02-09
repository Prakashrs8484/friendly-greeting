const router = require("express").Router();
const auth = require("../../middleware/auth");
const {
  improveNote,
  paraphraseNoteController,
  textToSpeechController
} = require("./controllers/noteAi.controller");

// Fix grammar, punctuation, clarity
router.post("/improve", auth, improveNote);

// Rewrite / paraphrase
router.post("/paraphrase", auth, paraphraseNoteController);

// Text-to-Speech
router.post("/tts", auth, textToSpeechController);

module.exports = router;
