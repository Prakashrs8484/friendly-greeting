/**
 * Fitness MCP Coach Routes
 * Endpoint: POST /api/mcp/fitness/generate
 */

const router = require('express').Router();
const fitnessCoachController = require('./controllers/fitnessCoach.controller');

/**
 * POST /api/mcp/fitness/generate
 * Generate superficial but encouraging coach response
 * 
 * Body:
 * {
 *   text: string,
 *   parsedActions: array,
 *   dashboard: object
 * }
 */
router.post('/generate', fitnessCoachController.generate);

module.exports = router;
