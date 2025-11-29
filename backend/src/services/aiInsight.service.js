const groq = require("./groq.service");

exports.generateFinanceInsights = async function (context) {
  try {
    const prompt = `
You are NeuraDesk’s Autonomous Finance Agent.

Your job:
1. Analyze the user's finance data.
2. Produce a short summary ("reply").
3. Propose actionable recommendations ("actions").

Return ONLY a JSON object like this:

{
  "reply": "summary here",
  "actions": [
    {
      "id": "random-uuid",
      "type": "adjust_budget" | "rebalance_investment" | "create_goal" | "flag_overspend" | "notify_user",
      "confidence": 0.0-1.0,
      "description": "Why this action is recommended",
      "payload": {}
    }
  ]
}

### USER CONTEXT ###
${JSON.stringify(context, null, 2)}
`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.4
    });

    let raw = completion.choices?.[0]?.message?.content || "{}";

    console.log("AI RAW OUTPUT:", raw); // HELP DEBUGGING

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.log("JSON parse error:", err.message);
      return { reply: raw, actions: [] }; // graceful fallback
    }

    return parsed; // DO NOT slice or modify
  } catch (error) {
    console.log("AI Insight Error:", error);
    return { reply: "Error generating insights", actions: [] };
  }
};
