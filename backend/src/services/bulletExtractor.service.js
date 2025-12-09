const groq = require("./groq.service");
exports.extractBullets = async (text) => {
    const prompt = `
  Extract the main points from the following text and convert them into concise bullet points.
  
  Rules:
  - Keep bullets short
  - No backticks
  - No extra commentary
  
  Text:
  ${text}
  `;
  
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: "You extract bullet points professionally." },
        { role: "user", content: prompt }
      ]
    });
  
    return res.choices[0].message.content.trim();
  };
  