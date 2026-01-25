const groq = require("./groq.service");

exports.generateOutline = async (topic) => {
  const prompt = `
Generate a clear, structured outline for the topic below.

RULES:
- Include: Introduction, 3–6 main sections, sub-points, conclusion.
- Keep it professional and organized.
- Perfect for essays, reports, research papers, or blog posts.
- Return ONLY pure JSON. No backticks.

FORMAT:
{
  "title": "",
  "outline": [
    { "section": "", "points": [] }
  ]
}

TOPIC:
${topic}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.5,
    messages: [
      { role: "system", content: "You generate structured writing outlines in clean JSON format." },
      { role: "user", content: prompt }
    ]
  });

  let raw = response.choices[0].message.content.trim();
  raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(raw);
  } catch (err) {
    console.error("Outline JSON parse failed:", raw);
    throw new Error("Invalid JSON returned by AI");
  }
};
