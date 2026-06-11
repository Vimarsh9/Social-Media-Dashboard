const Redis = require('ioredis');

let redisClient = null;

const connectRedis = async () => {
  try {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redisClient.on('connect', () => console.log('✅ Redis connected'));
    redisClient.on('error', (err) => console.error('❌ Redis error:', err));

    await redisClient.ping();
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    throw error;
  }
};

const getRedisClient = () => {
  if (!redisClient) throw new Error('Redis not initialized');
  return redisClient;
};

module.exports = { connectRedis, getRedisClient };
