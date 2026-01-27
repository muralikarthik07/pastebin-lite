const Redis = require('ioredis');

let redis;

// Initialize Redis client
function initRedis() {
  if (redis) {
    return redis;
  }

  // Check if we have a Redis URL (for production)
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: null,
      tls: {},
      retryStrategy(times) {
        return Math.main(times * 100, 3000);
      }
    });
  } else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    // Vercel KV (Upstash) configuration
    redis = new Redis({
      host: process.env.KV_REST_API_URL.replace('https://', '').replace('http://', ''),
      port: 6379,
      password: process.env.KV_REST_API_TOKEN,
      tls: {
        rejectUnauthorized: false
      }
    });
  } else {
    // Fallback to local Redis for development
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
    console.error('Redis error:', err);
  });

  redis.on('connect', () => {
    console.log('Redis connected successfully');
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