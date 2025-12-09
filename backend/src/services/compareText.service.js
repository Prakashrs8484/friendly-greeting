const groq = require("./groq.service");
exports.compareTexts = async (textA, textB) => {
    const prompt = `
  Compare the following two texts.
  
  Return ONLY pure JSON:
  {
    "differences": "",
    "similarities": "",
    "improvementSuggestions": ""
  }
  
  TEXT A:
  ${textA}
  
  TEXT B:
  ${textB}
  `;
  
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      messages: [
        { role: "system", content: "You compare two text samples professionally." },
        { role: "user", content: prompt }
      ]
    });
  
    let raw = res.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, "").trim();
  
    return JSON.parse(raw);
  };
  