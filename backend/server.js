// backend/server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const agentRoutes = require('./routes/agentRoutes'); // <-- NEW
const codegenRoutes = require('./routes/codegenRoutes'); // <-- NEW

const app = express();

// ----- Config -----
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI; // Atlas or local from .env

// ----- Middleware -----
app.use(express.json());

// CORS (explicit methods + headers; no app.options('*'))
app.use(
  cors({
    origin: ['http://localhost:1234', 'http://127.0.0.1:1234'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  })
);

// Minimal request logger (good for debugging)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.get('/health/db', async (_req, res) => {
  try {
    const state = mongoose.connection.readyState; // 0..3
    let ping = null;
    if (state === 1 && mongoose.connection.db) {
      ping = await mongoose.connection.db.admin().command({ ping: 1 });
    }
    res.json({ readyState: state, ping });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/tasks', taskRoutes); // Task management routes
app.use('/api/agent', agentRoutes); // <-- NEW: Agent routes for plan generation
app.use('/api/codegen', codegenRoutes); // <-- NEW: Code generation routes

// ----- Boot -----
(async () => {
  if (!MONGODB_URI) {
    console.error('❌ Missing MONGODB_URI in backend/.env');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI); // Mongoose 8+: no options needed
    console.log('✅ Database connected (Atlas):', MONGODB_URI);

    mongoose.connection.on('error', err =>
      console.error('❌ Mongo connection error:', err.message)
    );
    mongoose.connection.on('disconnected', () =>
      console.error('⚠️  Mongo disconnected')
    );

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('❌ Mongo connect failed:', err.message);
    console.error(
      '\nTroubleshooting (Atlas):\n' +
      ' • Allow your IP in Network Access (or 0.0.0.0/0 for dev).\n' +
      ' • Check DB user/password; URL-encode special chars.\n' +
      ' • Use the full SRV string (mongodb+srv://...).\n'
    );
    process.exit(1);
  }
})();
