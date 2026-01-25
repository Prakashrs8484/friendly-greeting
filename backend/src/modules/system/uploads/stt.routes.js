
const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const { speechToText } = require("../controllers/stt.controller");


router.post("/speech-to-text",upload.single("audio"), speechToText);

  
module.exports = router;
