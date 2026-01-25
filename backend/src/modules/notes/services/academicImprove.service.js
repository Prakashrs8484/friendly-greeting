const groq = require("./groq.service");

exports.academicImprove = async (text) => {
  try {
    const prompt = `
Rewrite the following text in a more formal, academic style.
Improve clarity, flow, vocabulary, and structure.
Keep the original meaning intact.

Text:
${text}
`;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: "You improve text for academic quality." },
        { role: "user", content: prompt }
      ]
    });

    return result.choices[0].message.content.trim();
  } catch (err) {
    console.error("Academic Improve Error:", err);
    throw new Error("Failed to improve text academically");
  }
};

  