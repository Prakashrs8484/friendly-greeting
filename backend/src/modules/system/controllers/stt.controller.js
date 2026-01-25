const { transcribeAudio } = require("../services/stt.service");

exports.speechToText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file provided" });
    }

    const audioBuffer = req.file.buffer;
    const text = await transcribeAudio(audioBuffer);

    return res.json({ text });
  } catch (error) {
    console.error("Speech-to-text error:", error);
    res.status(500).json({ error: "Transcription failed" });
  }
};

