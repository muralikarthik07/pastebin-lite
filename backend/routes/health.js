const express = require('express');
const router = express.Router();
const { getRedis } = require('../config/redis');

router.get('/healthz', async (req, res) => {
  try {
    const redis = getRedis();
    await redis.ping();
    res.json({ ok: true, redis: 'connected' });
  } catch (error) {
    res.json({ ok: false, redis: 'disconnected' });
  }
});

module.exports = router;