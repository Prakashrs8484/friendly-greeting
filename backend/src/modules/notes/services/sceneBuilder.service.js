const groq = require("../services/groq.service");

exports.buildScene = async (location, mood) => {
  const prompt = `
Generate a vivid, creative scene based on the details below.

LOCATION: ${location}
MOOD: ${mood}

GUIDELINES:
- Write 5–10 sentences.
- Use sensory details (sound, smell, light, temperature).
- Match the mood strongly.
- Do NOT write a story or plot. Just the setting description.
- Return ONLY the scene text, no explanation.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.8,
    messages: [
      { role: "system", content: "You generate rich, atmospheric scenes for writers." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content.trim();
};
