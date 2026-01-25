const groq = require("./groq.service");
exports.extractActions = async (text) => {
    const prompt = `
  Extract actionable tasks from the following meeting notes.
  
  Return ONLY pure JSON in this format:
  {
    "actions": [
      { "task": "", "owner": "", "deadline": "" }
    ]
  }
  
  Text:
  ${text}
  `;
  
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: "You extract actionable tasks from text." },
        { role: "user", content: prompt }
      ]
    });
  
    let raw = res.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, "").trim();
  
    return JSON.parse(raw);
  };
  