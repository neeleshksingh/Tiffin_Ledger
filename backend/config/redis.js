import { createClient } from 'redis';

const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    socket: {
        reconnectStrategy: (retries) => {
            if (retries > 20) {
                console.warn('Redis: Too many retries. Working offline.');
                return false; // Stop trying
            }
            return Math.min(retries * 500, 5000);
        }
    }
});

redisClient.on('error', (err) => {
    if (err.code === 'ECONNREFUSED') {
        console.warn('Redis not running. Continuing without cache...');
    } else {
        console.error('Redis Error:', err);
    }
});

redisClient.on('connect', () => console.log('Redis Connected'));
redisClient.on('ready', () => console.log('Redis Ready!'));

// Don't crash on connect failure
redisClient.connect().catch(() => {
    console.warn('Redis unavailable. App will work without cache.');
});

export default redisClient;