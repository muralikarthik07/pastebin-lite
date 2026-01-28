const Redis = require('ioredis');

let redis;

function initRedis() {
  if (redis) return redis;

  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      tls: { rejectUnauthorized: false }
    });
  } else {
    redis = new Redis({
      host: '127.0.0.1',
      port: 6379
    });
  }

  redis.on('error', (err) => console.error('Redis error:', err.message));
  redis.on('ready', () => console.log('Redis ready'));

  return redis;
}

function getCurrentTime(req) {
  if (process.env.TEST_MODE === '1' && req?.headers['x-test-now-ms']) {
    return parseInt(req.headers['x-test-now-ms'], 10);
  }
  return Date.now();
}

module.exports = { getRedis: initRedis, getCurrentTime };