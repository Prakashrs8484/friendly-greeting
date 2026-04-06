/**
 * Fitness MCP Coach Controller
 * Handles MCP requests for fitness coach analysis
 */

const { analyzeFitnessText } = require('../services/fitnessCoachAnalyzer.service');

async function generate(req, res) {
  try {
    const { text, parsedActions, dashboard } = req.body || {};

    // Validate required fields
    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ 
        success: false,
        message: 'text is required and must be a non-empty string' 
      });
    }

    if (!Array.isArray(parsedActions)) {
      return res.status(400).json({ 
        success: false,
        message: 'parsedActions is required and must be an array' 
      });
    }

    if (typeof dashboard !== 'object' || dashboard === null) {
      return res.status(400).json({ 
        success: false,
        message: 'dashboard is required and must be an object' 
      });
    }

    const result = analyzeFitnessText(text, parsedActions, dashboard);
    
    return res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error('Fitness coach analyzer error:', err);
    return res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
}

module.exports = {
  generate
};
