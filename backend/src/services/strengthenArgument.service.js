const groq = require("./groq.service");

exports.strengthenArgument = async (text) => {
  try {
    const prompt = `
Strengthen the following argument by improving logic, evidence, clarity, and academic tone.
Do NOT change the core idea. Enhance reasoning and coherence.

Argument:
${text}
`;

    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: "You strengthen arguments academically." },
        { role: "user", content: prompt }
      ]
    });

    return result.choices[0].message.content.trim();
  } catch (err) {
    console.error("Strengthen Argument Error:", err);
    throw new Error("Failed to strengthen argument");
  }
};
