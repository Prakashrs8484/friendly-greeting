const router = require("express").Router();
const auth = require("../middleware/auth");
const { generateSpeech } = require("../controllers/tts.controller");

// POST /api/notes/tts
router.post("/tts", auth, generateSpeech);

module.exports = router;
