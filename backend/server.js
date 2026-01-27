const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all origins during debugging
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-test-now-ms'],
  credentials: true
}));

// Parse JSON bodies - CRITICAL: This must be BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add logging middleware to debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Import routes
const healthRouter = require('./routes/health');
const pastesRouter = require('./routes/pastes');

// Mount routes
app.use('/api', healthRouter);
app.use('/api/pastes', pastesRouter);

// Root route for testing
app.get('/', (req, res) => {
  res.json({ 
    message: 'Pastebin API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /api/healthz',
      createPaste: 'POST /api/pastes',
      getPaste: 'GET /api/pastes/:id'
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  console.log('404 - Route not found:', req.method, req.path);
  res.status(404).json({ error: 'Not found', path: req.path, method: req.method });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error occurred:', err);
  res.status(500).json({ 
    error: 'Internal server error', 
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(50));
  console.log(`✅ Backend server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 Listening on: 0.0.0.0:${PORT}`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});