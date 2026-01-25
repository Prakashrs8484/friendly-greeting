const router = require("express").Router();
const auth = require("../../../middleware/auth");
const upload = require("../../../middleware/upload");
const { speechToText } = require("./controllers/stt.controller");
const { textToSpeechController } = require("./controllers/tts.controller");

// Speech-to-text route (can be used by notes or other modules)
router.post("/speech-to-text", upload.single("audio"), speechToText);

// Text-to-speech route
router.post("/tts", textToSpeechController);

module.exports = router;

