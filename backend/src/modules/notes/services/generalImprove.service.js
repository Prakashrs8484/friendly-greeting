const groq = require("./groq.service");

exports.generalImprove = async (text) => {
  try {
    const prompt = `
Rewrite the following text to improve clarity, flow, and readability for general notes.
Keep the original meaning intact, maintain an informal tone, and avoid formal academic language.
Focus on making it easier to understand and more engaging for everyday use.

Text:
${text}
`;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      messages: [
        { role: "system", content: "You improve text for general notes, keeping it informal and clear." },
        { role: "user", content: prompt }
      ]
    });

    return result.choices[0].message.content.trim();
  } catch (err) {
    console.error("General Improve Error:", err);
    throw new Error("Failed to improve text for general notes");
  }
};
