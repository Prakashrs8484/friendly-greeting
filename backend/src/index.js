require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const financeRoutes = require('./routes/finance.routes');
const aiRoutes = require('./routes/ai.routes');
const contextRoutes = require('./routes/context.routes');
const planningRoutes = require('./routes/planning.routes');
const aiActionRoutes = require('./routes/aiAction.routes');
const notesRoutes = require("./routes/notes.routes");



const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/context', contextRoutes);
app.use("/api/planning", planningRoutes);
app.use('/api/ai/action', aiActionRoutes);
app.use("/api/notes", notesRoutes);
app.get('/', (req, res) => res.json({ status: 'NeuraDesk backend (Option 1) running' }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
