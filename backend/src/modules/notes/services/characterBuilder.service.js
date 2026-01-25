const groq = require("./groq.service"); 

exports.buildCharacter = async (description) => {
  const prompt = `
You are a character creation assistant for fiction writers.

Generate a character profile in EXACT JSON format with these keys:
{
  "backstory": {},
  "traits": {},
  "motivations": {},
  "flaws": {},
  "strengths": {},
  "dialogue_style": {},
  "suggestions": {}
}

Rules:
- Return ONLY pure JSON.
- Do NOT wrap in backticks.
- Do NOT add any text outside the JSON.

User Description:
${description}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.75,
    messages: [
      { role: "system", content: "You generate character profiles in clean JSON with NO formatting." },
      { role: "user", content: prompt }
    ]
  });

  let raw = response.choices[0].message.content.trim();

  // Remove code fences if AI accidentally adds them
  raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("AI JSON parsing failed:", raw);
    throw new Error("Invalid AI JSON format");
  }
};
