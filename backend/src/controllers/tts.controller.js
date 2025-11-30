const { textToSpeech } = require("../services/tts.service");

exports.generateSpeech = async (req, res) => {
  try {
    const { text, voiceId } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const audioBuffer = await textToSpeech(text, voiceId);

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Disposition": 'attachment; filename="speech.mp3"',
    });

    return res.send(audioBuffer);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
