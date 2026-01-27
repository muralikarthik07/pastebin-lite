const express = require('express');
const router = express.Router();
const { getRedis } = require('../config/redis');

router.get('/healthz', async (req, res) => {
  try {
    const redis = getRedis();
    
    // Try to ping Redis to check connectivity
    await redis.ping();
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Health check failed:', error);
    // Still return 200 but indicate issue
    res.status(200).json({ ok: false, error: error.message });
  }
});

module.exports = router;