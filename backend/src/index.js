require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');

// ========== MODULE ROUTE IMPORTS ==========
// System module (auth, ai, agent, context, uploads)
const systemRoutes = require('./modules/system/system.routes');

// Feature modules
const financeRoutes = require('./modules/finance/finance.routes');
const planningRoutes = require('./modules/finance/planning.routes');
const aiActionRoutes = require('./modules/finance/aiAction.routes');
const notesRoutes = require('./modules/notes/notes.routes');
const nutritionRoutes = require('./modules/nutrition/nutrition.routes');
const healthRoutes = require('./modules/health/health.routes');
const lifestyleRoutes = require('./modules/lifestyle/lifestyle.routes');
const agentPagesRoutes = require('./modules/agentPages/agentPage.routes');

// ========== APP SETUP ==========
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

connectDB();

// ========== ROUTE REGISTRATION ==========
// System routes (auth, ai, agent, context, uploads)
app.use('/api/auth', systemRoutes.authRoutes);
app.use('/api/ai', systemRoutes.aiRoutes);
app.use('/api/context', systemRoutes.contextRoutes);
app.use('/api/agent', systemRoutes.agentRoutes);
app.use('/api/notes', systemRoutes.sttRoutes); // STT routes under /api/notes
app.use('/api/notes', systemRoutes.ttsRoutes); // TTS routes under /api/notes

// Feature module routes
app.use('/api/finance', financeRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/nutrition', nutritionRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/lifestyle', lifestyleRoutes);
app.use('/api/agent-pages', agentPagesRoutes);

// Backward compatibility routes (maintain existing API paths)
app.use('/api/planning', planningRoutes);
app.use('/api/ai/action', aiActionRoutes);

app.get('/', (req, res) => res.json({ status: 'NeuraDesk backend (Option 1) running' }));

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
