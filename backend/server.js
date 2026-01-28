const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS - Allow all origins
app.use(cors());

// Parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.url = req.url.trim();
  next();
});

// Logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
const healthRouter = require('./routes/health');
const pastesRouter = require('./routes/pastes');

app.use('/api', healthRouter);
app.use('/api/pastes', pastesRouter);

// Root
app.get('/', (req, res) => {
  res.json({ message: 'Pastebin API' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});