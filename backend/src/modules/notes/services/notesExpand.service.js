const groq = require("../services/groq.service");

exports.expandIdea = async (text) => {
  const prompt = `
Expand the following idea into a detailed, expressive paragraph.
Keep the tone natural, coherent, and creative.
Do not add unrelated storylines. Just deepen the idea meaningfully.
Return ONLY the expanded paragraph.

Original Idea:
${text}
  `;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.65,
    messages: [
      { role: "system", content: "You expand short ideas into rich, creative paragraphs." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content.trim();
};
