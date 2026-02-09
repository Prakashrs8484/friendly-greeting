const axios = require("axios");

// Mapping for OpenAI-like parameters to ElevenLabs
const voiceMap = {
  "alloy": "21m00Tcm4TlvDq8ikWAM", // Example ElevenLabs voice ID for alloy-like voice
  // Add more mappings as needed
};

const modelMap = {
  "tts-1": "eleven_multilingual_v2",
  // Add more mappings as needed
};

const formatMap = {
  "mp3": "mp3_44100_128",
  // Add more mappings as needed
};

exports.generateSpeech = async ({ text, voice = "alloy", model = "tts-1", response_format = "mp3" }) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) throw new Error("Missing ELEVENLABS_API_KEY");

    const voiceId = voiceMap[voice] || voice;
    const modelId = modelMap[model] || model;
    const outputFormat = formatMap[response_format] || response_format;

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

