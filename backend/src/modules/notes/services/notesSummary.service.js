const groq = require("./groq.service");

exports.summarizeNote = async (text) => {
  const prompt = `
Summarize the following text in a clear, concise way.
Do NOT add new information.
Do NOT change meaning.
Return ONLY the summary text in 3–5 sentences.

Text to summarize:
${text}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    messages: [
      { role: "system", content: "You summarize text with accuracy and clarity." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content.trim();
};
