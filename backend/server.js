const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - MUST be before other middleware
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://pastebinlite-chi.vercel.app',
      process.env.FRONTEND_URL
    ];
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-test-now-ms']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const healthRouter = require('./routes/health');
const pastesRouter = require('./routes/pastes');

app.use('/api', healthRouter);
app.use('/api/pastes', pastesRouter);

app.get('/', (req, res) => {
  res.json({ 
    message: 'Pastebin API is running',
    endpoints: {
      health: '/api/healthz',
      createPaste: 'POST /api/pastes',
      getPaste: 'GET /api/pastes/:id'
    }
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});