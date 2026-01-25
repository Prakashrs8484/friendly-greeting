const groq = require("../services/groq.service"); // adjust path if needed

exports.rewriteNote = async (text, mode) => {
  const styleDescriptions = {
    poetic: "Rewrite with rich imagery, metaphors, and poetic flow.",
    cinematic: "Rewrite as if describing scenes from a movie with vivid visuals.",
    professional: "Rewrite in a formal, polished, and business-like tone.",
    humorous: "Rewrite with light humor, wit, and playful tone.",
    emotional: "Rewrite with deeper feelings, warmth, and expressive emotion.",
    minimalist: "Rewrite in short, simple, clean sentences. No extra fluff.",
    dramatic: "Rewrite with strong tension, intensity, and bold expression.",
    shakespearean: "Rewrite in Shakespearean English, poetic and old-style.",
    simple: "Rewrite in plain English, easy to understand, beginner friendly.",
    expanded: "Expand the text into a longer, more detailed paragraph."
  };

  const selectedStyle = styleDescriptions[mode] || "Rewrite clearly and creatively.";

  const prompt = `
You are a writing assistant. Transform the user's text using this style instruction:
STYLE: ${selectedStyle}

Return ONLY the rewritten text, no explanations.

Original:
${text}
`;

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.6,
    messages: [
      { role: "system", content: "You rewrite text in creative, stylistic ways." },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0].message.content.trim();
};
