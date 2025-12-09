const groq = require("./groq.service");
exports.academicImprove = async (text) => {
    const prompt = `
  Rewrite the following text in a formal, academic tone.
  Improve clarity, structure, and coherence.
  No extra meaning should be added.
  
  Text:
  ${text}
  `;
  
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.25,
      messages: [
        { role: "system", content: "You rewrite text in academic tone." },
        { role: "user", content: prompt }
      ]
    });
  
    return res.choices[0].message.content.trim();
  };
  