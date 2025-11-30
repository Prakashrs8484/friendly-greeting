const axios = require("axios");
require("dotenv").config();

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
const DEFAULT_VOICE = process.env.DEFAULT_TTS_VOICE || "JBFqnCBsd6RMkjVDRZzb"; // Free voice

exports.textToSpeech = async (text, voiceId = DEFAULT_VOICE) => {
  try {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`;

    const response = await axios.post(
      url,
      {
        text: text,
        model_id: "eleven_multilingual_v2",
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
        },
        responseType: "arraybuffer", // IMPORTANT: audio output
      }
    );

    return response.data; // audio buffer
  } catch (error) {
    console.error("TTS Error:", error.response?.data || error.message);
    throw new Error("Failed to generate speech");
  }
};
