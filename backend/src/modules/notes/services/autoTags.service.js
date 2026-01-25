const groq = require("./groq.service");

exports.generateTags = async (text) => {
  const prompt = `
Analyze the following text and extract:

- genre
- topic
- mood
- suggestedCategory (1 word or short phrase)

Return ONLY pure JSON. No backticks.

JSON format:
{
  "genre": "",
  "topic": "",
  "mood": "",
  "suggestedCategory": ""
}

Text:
${text}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.45,
    messages: [
      { role: "system", content: "You classify text into genre, topic, mood, and category. Output pure JSON only." },
      { role: "user", content: prompt }
    ]
  });

  let raw = response.choices[0].message.content.trim();
  raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Auto-tags JSON parsing failed:", raw);
    throw new Error("Invalid JSON returned by AI");
  }
};
