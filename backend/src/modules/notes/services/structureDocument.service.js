const groq = require("./groq.service");

exports.structureDocument = async (text) => {
  const prompt = `
Restructure the following messy text into a clean, professional document.

Rules:
- Add H1, H2, H3 headings where appropriate
- Use bullet points for lists
- Improve readability and flow
- DO NOT add extra information
- Return ONLY pure markdown (no backticks)

Text:
${text}
`;

  const res = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    messages: [
      { role: "system", content: "You restructure messy text into clear professional documents." },
      { role: "user", content: prompt }
    ]
  });

  return res.choices[0].message.content.trim();
};
