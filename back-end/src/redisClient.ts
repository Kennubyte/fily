// redisClient.ts
import { createClient } from 'redis';

const client = createClient({
    url: 'redis://192.168.3.202:6379',
});

client.on('connect', () => {
    console.log('Redis Client Connected');
});

client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

(async () => {
    await client.connect();
})();

export default client;
