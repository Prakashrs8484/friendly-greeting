require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const financeRoutes = require('./routes/finance.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// connect DB
connectDB();

// routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/ai', aiRoutes);

app.get('/', (req, res) => res.json({ status: 'NeuraDesk backend running' }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
