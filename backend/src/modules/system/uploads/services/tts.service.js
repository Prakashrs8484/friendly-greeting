const axios = require("axios");

exports.generateSpeech = async ({ text, voiceId, modelId = "eleven_multilingual_v2", outputFormat = "mp3_44100_128" }) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY");

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${outputFormat}`;

    const response = await axios.post(
      url,
      {
        text,
        model_id: modelId
      },
      {
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer"  // IMPORTANT → audio stream support
      }
    );

    return response.data; // binary buffer
  } catch (err) {
    console.error("TTS Service Error:", err.response?.data || err.message);
    throw new Error("TTS generation failed");
  }
};

