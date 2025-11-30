const router = require("express").Router();
const auth = require("../middleware/auth");
const {
  improveNote,
  paraphraseNoteController
} = require("../controllers/noteAi.controller");

// Fix grammar, punctuation, clarity
router.post("/improve", auth, improveNote);

// Rewrite / paraphrase
router.post("/paraphrase", auth, paraphraseNoteController);

module.exports = router;
