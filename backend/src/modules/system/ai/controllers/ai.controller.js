const FinancialContext = require('../../../finance/models/FinancialContext');
const CareerContext = require('../../models/CareerContext');
const HealthContext = require('../../../health/models/HealthContext');
const NutritionContext = require('../../../nutrition/models/NutritionContext');
const LifestyleContext = require('../../../lifestyle/models/LifestyleContext');
const NotesContext = require('../../../notes/models/NotesContext');
const groq = require('../../services/groq.service');
const { analyzeNutritionText } = require('../../../mcp/nutrition/services/nutritionAnalyzer.service');
const { invokeNutritionAnalyzeViaMcp } = require('../services/nutritionMcpClient.service');

async function callGroqSystem(systemPrompt, userMessage) {
  try {
    const result = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',  // ✅ updated model
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.4
    });

    return result.choices?.[0]?.message?.content || '';
  } catch (err) {
    console.log("Groq Call Error:", err.response?.data || err.message);
    throw err;
  }
}

/* -------- FINANCE AGENT -------- */

exports.financeChat = async (req, res) => {
  try {
    const { message } = req.body;
    const context = await FinancialContext.findOne({ userId: req.user._id });

    const systemPrompt = `
You are NeuraDesk's Finance Agent. Use this financial context to answer:
${JSON.stringify(context || {}, null, 2)}
    `;

    const reply = await callGroqSystem(systemPrompt, message);
    return res.json({ reply });

  } catch (err) {
    console.log("AI ERROR (Finance):", err);
    return res.status(500).json({ message: err.message });
  }
};

/* -------- CAREER AGENT -------- */

exports.careerChat = async (req, res) => {
  try {
    const { message } = req.body;
    const context = await CareerContext.findOne({ userId: req.user._id });

    const systemPrompt = `
You are NeuraDesk Career Agent. Use context:
${JSON.stringify(context || {}, null, 2)}
    `;

    const reply = await callGroqSystem(systemPrompt, message);
    return res.json({ reply });

  } catch (err) {
    console.log("AI ERROR (Career):", err);
    return res.status(500).json({ message: err.message });
  }
};

/* -------- HEALTH AGENT -------- */

exports.healthChat = async (req, res) => {
  try {
    const { message } = req.body;
    const context = await HealthContext.findOne({ userId: req.user._id });

    const systemPrompt = `
You are NeuraDesk Health Agent. Use context:
${JSON.stringify(context || {}, null, 2)}
    `;

    const reply = await callGroqSystem(systemPrompt, message);
    return res.json({ reply });

  } catch (err) {
    console.log("AI ERROR (Health):", err);
    return res.status(500).json({ message: err.message });
  }
};

/* -------- NUTRITION AGENT -------- */

exports.nutritionChat = async (req, res) => {
  try {
    const { message } = req.body;
    const context = await NutritionContext.findOne({ userId: req.user._id });

    if (typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ message: 'message is required and must be a non-empty string' });
    }

    let nutritionAnalysis = null;
    let analysisSource = 'none';
    const useMcpNutrition = process.env.USE_MCP_NUTRITION !== 'false';

    if (useMcpNutrition) {
      try {
        nutritionAnalysis = await invokeNutritionAnalyzeViaMcp(message.trim(), {
          timeoutMs: Number(process.env.NUTRITION_MCP_TIMEOUT_MS) || 9000
        });
        analysisSource = 'mcp';
      } catch (mcpError) {
        console.warn('[nutritionChat] MCP call failed, using deterministic fallback:', mcpError.message);
      }
    }

    if (!nutritionAnalysis) {
      nutritionAnalysis = analyzeNutritionText(message.trim());
      analysisSource = 'fallback';
    }

    const systemPrompt = `
You are NeuraDesk Nutrition Agent. Use context and deterministic nutrition analysis.
Never recalculate macros from scratch. Use the deterministic totals and item values provided below.
${JSON.stringify(context || {}, null, 2)}

Nutrition analysis (${analysisSource}):
${JSON.stringify(nutritionAnalysis, null, 2)}
    `;

    const reply = await callGroqSystem(systemPrompt, message);
    return res.json({
      reply,
      nutritionAnalysis,
      mcpUsed: analysisSource === 'mcp',
      analysisSource
    });

  } catch (err) {
    console.log("AI ERROR (Nutrition):", err);
    return res.status(500).json({ message: err.message });
  }
};

/* -------- LIFESTYLE AGENT -------- */

exports.lifestyleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const context = await LifestyleContext.findOne({ userId: req.user._id });

    const systemPrompt = `
You are NeuraDesk Lifestyle Agent. Use context:
${JSON.stringify(context || {}, null, 2)}
    `;

    const reply = await callGroqSystem(systemPrompt, message);
    return res.json({ reply });

  } catch (err) {
    console.log("AI ERROR (Lifestyle):", err);
    return res.status(500).json({ message: err.message });
  }
};

/* -------- NOTES AGENT -------- */

exports.notesChat = async (req, res) => {
  try {
    const { message } = req.body;
    const context = await NotesContext.findOne({ userId: req.user._id });

    const systemPrompt = `
You are NeuraDesk Notes Agent. Use context:
${JSON.stringify(context || {}, null, 2)}
    `;

    const reply = await callGroqSystem(systemPrompt, message);
    return res.json({ reply });

  } catch (err) {
    console.log("AI ERROR (Notes):", err);
    return res.status(500).json({ message: err.message });
  }
};
