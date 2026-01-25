const groq = require("../../services/groq.service");
const fs = require("fs-extra");
const path = require("path");

exports.transcribeAudio = async (audioBuffer) => {
  try {
    const tempPath = path.join(__dirname, "../../../../tmp");
    await fs.ensureDir(tempPath);

    const filePath = path.join(tempPath, `audio_${Date.now()}.mp3`);

    // Write the file to disk
    await fs.writeFile(filePath, audioBuffer);

    // Read as stream (Groq expects this)
    const fileStream = fs.createReadStream(filePath);

    const result = await groq.audio.transcriptions.create({
      file: fileStream,
      model: "whisper-large-v3-turbo",
      response_format: "json"
    });

    // Remove temp file
    await fs.remove(filePath);

    return result.text || "";
  } catch (err) {
    console.error("STT ERROR:", err);
    throw err;
  }
};

