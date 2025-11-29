// AI endpoint placeholder - integrate OpenAI or other LLM here
const axios = require('axios');

exports.financeChat = async (req, res) => {
  try {
    const { message } = req.body;
    // Example: you would call OpenAI here with user context & message
    // Return a simple echo for now
    return res.json({ reply: `Finance Agent received: ${message}` });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
