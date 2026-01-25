const groq = require("./groq.service");

// Correct grammar, punctuation, clarity
exports.correctNote = async (text) => {
  try {
    const prompt = `
You are an expert writing assistant. Improve the following note by:
- Fixing grammar and punctuation
- Improving clarity
- Keeping the meaning the same
- Maintaining the writer’s tone and style
- Returning ONLY the corrected text
Note:
${text}
`;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You improve text without changing its meaning." },
        { role: "user", content: prompt }
      ]
    });

    return result.choices[0].message.content.trim();
  } catch (error) {
    console.error("Correction Error:", error);
    throw new Error("Failed to correct note");
  }
};

// Paraphrasing with improved structure
exports.paraphraseNote = async (text) => {
  try {
    const prompt = `
Rewrite the following note with better structure, flow, clarity, and readability.
Keep meaning intact but improve sentence construction and coherence.
Return ONLY the improved text.

Note:
${text}
`;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        { role: "system", content: "You rewrite notes for clarity and improved structure." },
        { role: "user", content: prompt }
      ]
    });

    return result.choices[0].message.content.trim();
  } catch (error) {
    console.error("Paraphrasing Error:", error);
    throw new Error("Failed to paraphrase note");
  }
};
