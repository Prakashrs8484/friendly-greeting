const groq = require("./groq.service");
exports.strengthenArgument = async (text) => {
    const prompt = `
  Strengthen the argument in the text below.
  Improve logic, reasoning, clarity, and persuasive power.
  Do NOT change the core meaning.
  
  Return only the improved argument.
  
  Text:
  ${text}
  `;
  
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.35,
      messages: [
        { role: "system", content: "You strengthen arguments professionally." },
        { role: "user", content: prompt }
      ]
    });
  
    return res.choices[0].message.content.trim();
  };
  