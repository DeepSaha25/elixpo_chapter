const redis = require('redis');
const { RateLimiterRedis } = require('rate-limiter-flexible');

const redisClient = redis.createClient({
    // Your Redis configuration
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    await redisClient.connect();
})();

const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10, // 10 requests
    duration: 1, // per 1 second by IP
});

const checkUsernameInSet = async (username) => {
    try {
        return await redisClient.sIsMember('usernames_set', username);
    } catch (error) {
        console.error('Error checking username in Redis Set:', error);
        return false;
    }
};

const addUsernameToSet = async (username) => {
    try {
        await redisClient.sAdd('usernames_set', username);
    } catch (error) {
        console.error('Error adding username to Redis Set:', error);
    }
};

module.exports = {
    redisClient,
    rateLimiter,
    checkUsernameInSet,
    addUsernameToSet,
};