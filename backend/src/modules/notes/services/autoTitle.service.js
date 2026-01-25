const groq = require("./groq.service");
exports.generateTitle = async (text) => {
  const prompt = `
Generate a title, subtitle, and 3-5 keywords for the following text.

Rules:
- Be concise.
- Keep meaning aligned with the text.
- Return ONLY valid JSON.
- DO NOT use backticks.

Example JSON format:
{
  "title": "",
  "subtitle": "",
  "keywords": []
}

Text:
${text}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.55,
    messages: [
      { role: "system", content: "You generate titles and subtitles in clean JSON format." },
      { role: "user", content: prompt }
    ]
  });

  let raw = response.choices[0].message.content.trim();

  raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Auto-title JSON parsing failed:", raw);
    throw new Error("Invalid JSON returned by AI");
  }
};
