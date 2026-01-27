const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - MUST be first
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-test-now-ms']
}));

app.options('*', cors()); // Handle preflight

// Body parsing - AFTER CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const healthRouter = require('./routes/health');
const pastesRouter = require('./routes/pastes');

app.use('/api', healthRouter);
app.use('/api/pastes', pastesRouter);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server on port ${PORT}`);
});