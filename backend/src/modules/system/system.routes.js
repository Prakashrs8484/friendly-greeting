const auth = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// Controllers
const authController = require('./auth/controllers/auth.controller');
const sttController = require('./uploads/controllers/stt.controller');
const ttsController = require('./uploads/controllers/tts.controller');
const aiController = require('./ai/controllers/ai.controller');
const agentQueryController = require('./agent/controllers/agentQuery.controller');
const liveMemoryController = require('./agent/controllers/liveMemory.controller');

// Context models
const FinancialContext = require('../finance/models/FinancialContext');
const CareerContext = require('./models/CareerContext');
const HealthContext = require('../health/models/HealthContext');
const NutritionContext = require('../nutrition/models/NutritionContext');
const LifestyleContext = require('../lifestyle/models/LifestyleContext');
const NotesContext = require('../notes/models/NotesContext');

// ========== AUTH ROUTES ==========
const authRoutes = require('express').Router();
authRoutes.post('/signup', authController.signup);
authRoutes.post('/signin', authController.signin);

// ========== AI CHAT ROUTES ==========
const aiRoutes = require('express').Router();
aiRoutes.post('/finance', auth, aiController.financeChat);
aiRoutes.post('/career', auth, aiController.careerChat);
aiRoutes.post('/health', auth, aiController.healthChat);
aiRoutes.post('/nutrition', auth, aiController.nutritionChat);
aiRoutes.post('/lifestyle', auth, aiController.lifestyleChat);
aiRoutes.post('/notes', auth, aiController.notesChat);

// ========== AGENT ROUTES ==========
const agentRoutes = require('express').Router();
agentRoutes.post('/live', auth, liveMemoryController.updateLiveDraftController);
agentRoutes.post('/query', auth, agentQueryController.agentQueryController);
agentRoutes.get('/memories', auth, agentQueryController.getMemoriesController);

// ========== STT ROUTES ==========
const sttRoutes = require('express').Router();
sttRoutes.post('/speech-to-text', upload.single("audio"), sttController.speechToText);

// ========== TTS ROUTES ==========
const ttsRoutes = require('express').Router();
ttsRoutes.post('/tts', ttsController.textToSpeechController);

// ========== CONTEXT ROUTES ==========
const contextRoutes = require('express').Router();
contextRoutes.get('/finance', auth, async (req, res) => {
  const ctx = await FinancialContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
contextRoutes.get('/career', auth, async (req, res) => {
  const ctx = await CareerContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
contextRoutes.get('/health', auth, async (req, res) => {
  const ctx = await HealthContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
contextRoutes.get('/nutrition', auth, async (req, res) => {
  const ctx = await NutritionContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
contextRoutes.get('/lifestyle', auth, async (req, res) => {
  const ctx = await LifestyleContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});
contextRoutes.get('/notes', auth, async (req, res) => {
  const ctx = await NotesContext.findOne({ userId: req.user._id });
  res.json(ctx || {});
});

// Export all routes for backward compatibility
module.exports = {
  authRoutes,
  aiRoutes,
  agentRoutes,
  sttRoutes,
  ttsRoutes,
  contextRoutes
};

