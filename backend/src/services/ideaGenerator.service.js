const groq = require("./groq.service");

exports.generateIdeas = async (mode, topic) => {
  const modeInstructions = {
    story: "Generate 3 original story ideas with a strong hook.",
    poem: "Generate 3 poetic prompts with vivid imagery and symbolism.",
    article: "Generate 3 article ideas with clear angles and topics.",
    youtube: "Generate 3 YouTube video script ideas with engaging hooks.",
    motivational: "Generate 3 motivational writing prompts with emotional impact.",
    romantic: "Generate 3 romantic scene or story ideas with emotional depth."
  };

  const instruction = modeInstructions[mode] || modeInstructions["story"];

  const prompt = `
Based on the given mode, generate creative ideas.

MODE: ${mode}
TOPIC (optional): ${topic || "none"}

Instruction:
${instruction}

Rules:
- Produce exactly 3 ideas.
- Number them 1, 2, 3.
- Keep them short but creative.
- Do NOT add anything outside the list.
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.85,
    messages: [
      { role: "system", content: "You generate creative ideas for writers and creators." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content.trim();
};
