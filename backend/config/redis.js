import { Redis } from '@upstash/redis';

let redisClient = null;

const createUpstashClient = async () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.warn('Upstash: Missing URL or TOKEN. App will work without cache.');
        return null;
    }

    try {
        const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;

        const client = new Redis({
            url: cleanUrl,
            token,
            retry: {
                retries: 3,
                backoff: (retryCount) => Math.min(retryCount * 100, 1000),
            },
        });

        // Test connection with timeout
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Connection timeout')), 5000)
        );

        await Promise.race([client.ping(), timeoutPromise]);

        console.log('✅ Upstash Redis connected successfully');
        return client;
    } catch (error) {
        console.error('❌ Upstash Redis connection failed:', error.message);

        // Check if it's a DNS issue
        if (error.code === 'ENOTFOUND' || error.message.includes('getaddrinfo')) {
            console.error(`
            DNS Resolution Failed!
            
            Possible solutions:
            1. Check your internet connection
            2. Verify the Upstash Redis URL is correct
            3. Try using a different DNS (Google DNS: 8.8.8.8)
            4. Check if Upstash is available in your region
            `);
        }

        return null;
    }
};

const initializeRedis = async (maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
        redisClient = await createUpstashClient();
        if (redisClient) break;

        if (i < maxRetries - 1) {
            console.log(`Retrying Redis connection (${i + 1}/${maxRetries})...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    if (!redisClient) {
        console.warn('⚠️  Continuing without Redis cache');
    }
};

initializeRedis().catch(console.error);

export const getRedisClient = () => redisClient;
export default redisClient;