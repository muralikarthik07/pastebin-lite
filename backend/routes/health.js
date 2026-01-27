const express = require('express');
const router = express.Router();
const { getRedis } = require('../config/redis');

router.get('/healthz', async (req, res) => {
  console.log('💊 Health check requested');
  
  try {
    const redis = getRedis();
    
    // Try to ping Redis to check connectivity
    const result = await redis.ping();
    console.log('✅ Redis ping result:', result);
    
    res.status(200).json({ 
      ok: true,
      redis: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Health check failed:', error);
    // Still return 200 but indicate issue
    res.status(200).json({ 
      ok: false, 
      redis: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;