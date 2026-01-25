const financeAgent = require('../../../agents/finance.agent');
const nutritionAgent = require('../../../agents/nutrition.agent');
const healthAgent = require('../../../agents/health.agent');
const lifestyleAgent = require('../../../agents/lifestyle.agent');
const notesAgent = require('../../../agents/notes.agent');
const CareerContext = require('../../../models/CareerContext');
const BaseAgent = require('../../../agents/baseAgent');

const careerAgent = new BaseAgent();

/* -------- FINANCE AGENT -------- */
exports.financeChat = async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await financeAgent.chat(req.user._id, message);
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
    const reply = await careerAgent.callLLM(systemPrompt, message);
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
    const reply = await healthAgent.chat(req.user._id, message);
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
    const reply = await nutritionAgent.chat(req.user._id, message);
    return res.json({ reply });
  } catch (err) {
    console.log("AI ERROR (Nutrition):", err);
    return res.status(500).json({ message: err.message });
  }
};

/* -------- LIFESTYLE AGENT -------- */
exports.lifestyleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const reply = await lifestyleAgent.chat(req.user._id, message);
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
    const reply = await notesAgent.chat(req.user._id, message);
    return res.json({ reply });
  } catch (err) {
    console.log("AI ERROR (Notes):", err);
    return res.status(500).json({ message: err.message });
  }
};

