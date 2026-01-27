const Redis = require('ioredis');

let redis;

// Initialize Redis client
function initRedis() {
  if (redis) {
    return redis;
  }

  // Priority 1: REDIS_URL (Upstash format)
  if (process.env.REDIS_URL) {
    console.log('Connecting to Redis using REDIS_URL...');
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  } 
  // Priority 2: Upstash REST API (alternative format)
  else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    console.log('Connecting to Redis using Upstash REST API credentials...');
    const host = process.env.KV_REST_API_URL
      .replace('https://', '')
      .replace('http://', '');
    
    redis = new Redis({
      host: host,
      port: 6379,
      password: process.env.KV_REST_API_TOKEN,
      tls: {
        rejectUnauthorized: false
      },
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
  } 
  // Priority 3: Local Redis for development
  else {
    console.log('Connecting to local Redis...');
    redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });
  }

  redis.on('error', (err) => {
    console.error('Redis error:', err.message);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected successfully');
  });

  redis.on('ready', () => {
    console.log('✅ Redis ready to accept commands');
  });

  return redis;
}

// Get current time (supports test mode)
function getCurrentTime(req) {
  const testMode = process.env.TEST_MODE === '1';
  if (testMode && req && req.headers['x-test-now-ms']) {
    return parseInt(req.headers['x-test-now-ms'], 10);
  }
  return Date.now();
}

module.exports = {
  getRedis: initRedis,
  getCurrentTime
};