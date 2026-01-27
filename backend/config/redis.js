const Redis = require('ioredis');

let redis;

// Initialize Redis client
function initRedis() {
  if (redis) {
    return redis;
  }

  console.log('🔌 Initializing Redis connection...');

  // Check environment variables
  console.log('Environment check:');
  console.log('- REDIS_URL:', process.env.REDIS_URL ? 'SET (hidden)' : 'NOT SET');
  console.log('- KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'SET' : 'NOT SET');
  console.log('- KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'SET (hidden)' : 'NOT SET');

  // Priority 1: REDIS_URL (standard format)
  if (process.env.REDIS_URL) {
    console.log('📡 Connecting to Redis using REDIS_URL...');
    
    try {
      redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        enableReadyCheck: false,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          console.log(`Retry attempt ${times}, waiting ${delay}ms`);
          return delay;
        },
        tls: {
          rejectUnauthorized: false
        },
        lazyConnect: false,
        connectTimeout: 10000
      });
    } catch (error) {
      console.error('❌ Failed to create Redis client:', error);
      throw error;
    }
  } 
  // Priority 2: Local Redis for development
  else {
    console.log('📡 Connecting to local Redis...');
    redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
  }

  // Event handlers
  redis.on('error', (err) => {
    console.error('❌ Redis error:', err.message);
  });

  redis.on('connect', () => {
    console.log('🔗 Redis connecting...');
  });

  redis.on('ready', () => {
    console.log('✅ Redis connection ready!');
  });

  redis.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...');
  });

  redis.on('end', () => {
    console.log('🔌 Redis connection closed');
  });

  return redis;
}

// Get current time (supports test mode)
function getCurrentTime(req) {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode && req && req.headers['x-test-now-ms']) {
    const testTime = parseInt(req.headers['x-test-now-ms'], 10);
    console.log(`⏰ Using test time: ${testTime}`);
    return testTime;
  }
  return Date.now();
}

module.exports = {
  getRedis: initRedis,
  getCurrentTime
};