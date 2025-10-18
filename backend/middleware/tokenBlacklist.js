import { redisClient } from '../config/redis.js';

export const blacklistToken = async (jti, exp) => {
  const nowSec = Math.floor(Date.now() / 1000);
  const ttl = exp - nowSec;

  if (ttl <= 0) {
    console.warn(`Token ${jti} already expired — skipping blacklist`);
    return;
  }

  if (!redisClient?.isReady) {
    console.warn('Redis client not connected - skipping blacklist');
    return;
  }

  try {
    await redisClient.set(`auth:blacklist:${jti}`, 'revoked', { EX: ttl });
    console.log(`Token ${jti} blacklisted for ${ttl}s`);
  } catch (err) {
    console.error('Failed to blacklist token in Redis:', err);
  }
};

export const isTokenBlacklisted = async (jti) => {
  if (!redisClient?.isReady) {
    console.warn('Redis client not connected - skipping blacklist check');
    return false;
  }

  try {
    const exists = await redisClient.exists(`auth:blacklist:${jti}`);
    return exists === 1;
  } catch (err) {
    console.error('Error checking Redis blacklist:', err);
    return false;
  }
};

export const blacklistUserTokens = async (userId) => {
  if (!redisClient?.isReady) {
    console.warn('Redis client not connected - skipping user token blacklist');
    return;
  }

  try {
    const pattern = `auth:user:${userId}:*`;
    const keys = await redisClient.keys(pattern);
    
    if (keys.length > 0) {
      const pipeline = redisClient.multi();

      for (const key of keys) {
        const jti = key.split(':').pop();
        const ttl = await redisClient.ttl(key);

        if (ttl > 0) {
          pipeline.set(`auth:blacklist:${jti}`, 'revoked', { EX: ttl });
        } else {
          console.warn(`Skipping ${key} — already expired or no TTL`);
        }

        pipeline.del(key);
      }

      await pipeline.exec();
      console.log(`Blacklisted ${keys.length} tokens for user ${userId}`);
    }
  } catch (err) {
    console.error('Error blacklisting user tokens:', err);
  }
};


export const storeUserToken = async (userId, jti, exp) => {
  if (!redisClient?.isReady) {
    console.warn('Redis client not connected - skipping token storage');
    return;
  }

  try {
    const nowSec = Math.floor(Date.now() / 1000);
    const ttl = exp - nowSec;
    
    if (ttl > 0) {
      await redisClient.set(`auth:user:${userId}:${jti}`, 'active', { EX: ttl });
    }
  } catch (err) {
    console.error('Error storing user token:', err);
  }
};