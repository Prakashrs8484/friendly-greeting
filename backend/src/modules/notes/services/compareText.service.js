const groq = require("./groq.service");

exports.compareTexts = async (textA, textB) => {
  try {
    const prompt = `
Compare Text A and Text B deeply and provide **non-empty** content for each section below.
If a section has no meaningful content, explain why instead of leaving it blank.

Output in this exact structure:

## Comparison Results

### Differences
- Point 1
- Point 2

### Similarities
- Point 1
- Point 2

### Suggested Improvements
- Point 1
- Point 2

Text A:
${textA}

Text B:
${textB}
`;


    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      messages: [
        { role: "system", content: "You compare texts academically with clarity." },
        { role: "user", content: prompt }
      ]
    });

    return result.choices[0].message.content.trim();
  } catch (err) {
    console.error("CompareText Error:", err);
    throw new Error("Failed to compare texts");
  }
};
