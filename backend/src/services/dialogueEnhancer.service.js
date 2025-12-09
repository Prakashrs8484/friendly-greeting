const groq = require("./groq.service");

exports.enhanceDialogue = async (text, style) => {
  const styleInstructions = {
    natural: "Make the dialogue sound natural and conversational.",
    emotional: "Add emotional depth, vulnerability, and expressive tone.",
    romantic: "Add warmth, softness, intimacy, and subtle affection.",
    dramatic: "Add strong tension, intensity, and impactful delivery.",
    comedic: "Add humor, wit, playful timing, and light sarcasm.",
    formal: "Use polite, structured, refined dialogue.",
    aggressive: "Use confrontational, sharp, intense tone.",
    mysterious: "Use cryptic hints, quiet intensity, and suspense."
  };

  const selected = styleInstructions[style] || styleInstructions["natural"];

  const prompt = `
Enhance the following dialogue based on this style: ${selected}

Rules:
- Keep meaning consistent.
- Improve flow, pacing, and character tone.
- Output ONLY the enhanced dialogue.
- No explanations. No analysis.

Original Dialogue:
${text}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    messages: [
      { role: "system", content: "You rewrite dialogue to make it natural, expressive, and stylistically rich." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content.trim();
};
