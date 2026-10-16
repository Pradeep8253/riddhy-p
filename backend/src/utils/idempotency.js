import { redisClient } from '../config/redis.js';
export async function checkIdempotency(key){
  const exists=await redisClient.get(`idem:${key}`);
  if(exists) return { duplicate:true, result: JSON.parse(exists) };
  return { duplicate:false };
}
export async function saveIdempotency(key, result, ttl=3600){
  await redisClient.setEx(`idem:${key}`, ttl, JSON.stringify(result));
}
