import { createClient } from 'redis';
import { env } from './env.js';
export const redisClient = createClient({ url: env.REDIS_URL });
redisClient.on('error', e=> console.error('Redis error',e));
export async function connectRedis(){ try{ await redisClient.connect(); console.log('Redis connected'); }catch(e){ console.error('Redis fail',e.message); } }
