const { generateSpeech } = require("../services/tts.service");

exports.textToSpeechController = async (req, res) => {
  try {
    const { text} = req.body;
    const voiceId=process.env.DEFAULT_TTS_VOICE;
    if (!text || !voiceId) {
      return res.status(400).json({ error: "text and voiceId required" });
    }
    const audioBuffer = await generateSpeech({ text, voiceId });

    res.setHeader("Content-Type", "audio/mpeg");
    return res.send(audioBuffer);

  } catch (err) {
    console.error("TTS Controller Error:", err.response?.data || err.message || err);
    return res.status(500).json({ error: err.message });
  }
};
