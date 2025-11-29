const groq = require("./groq.service"); // you already have this from finance

// --- Auto Summary ---
exports.summarizeNote = async (text) => {
  try {
    const prompt = `
Summarize this note in 2–3 lines:
${text}
`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }]
    });

    return completion.choices[0].message.content.trim();
  } catch {
    return "";
  }
};

// --- Emotion Analysis ---
exports.analyzeEmotion = async (text) => {
  try {
    const prompt = `
Analyze the emotional tone of the following text. 
Return JSON like:
{ "label": "emotion", "score": 0-1 }

Text:
${text}
`;

    const completion = await groq.chat.completions.create({
      model: "llama3-70b-8192",
      messages: [{ role: "user", content: prompt }]
    });

    const result = JSON.parse(completion.choices[0].message.content.trim());
    return result;
  } catch {
    return { label: "", score: 0 };
  }
};

// --- Vector Embedding (RAG Search) ---
exports.embedNote = async (text) => {
  try {
    const embedding = await groq.embeddings.create({
      model: "nomic-embed-text",
      input: text
    });

    return embedding.data[0].embedding;
  } catch {
    return [];
  }
};
