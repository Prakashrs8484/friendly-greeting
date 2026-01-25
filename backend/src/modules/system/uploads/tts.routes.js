const express = require("express");
const router = express.Router();

const { textToSpeechController } = require("../controllers/tts.controller");

router.post("/tts", textToSpeechController);

module.exports = router;
