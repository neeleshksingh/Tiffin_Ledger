import { Redis } from '@upstash/redis';

let redisClient;

const createUpstashClient = () => {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
        console.warn('Upstash: Missing URL or TOKEN. App will work without cache.');
        return null;
    }

    const client = new Redis({
        url,
        token,
    });

    client.ping().then((pong) => {
        console.log('Upstash Redis Ready!', pong);
    }).catch((err) => {
        console.error('Upstash Redis Init Error:', err);
    });

    return client;
};

redisClient = createUpstashClient();

export default redisClient;