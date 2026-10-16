import { redisClient } from '../config/redis.js';
export async function reserveStock(sku, qty, ttlSec=900){
  // atomic reserve via Redis + Mongo transaction (simplified)
  const key=`reserve:${sku}`;
  const current=await redisClient.get(key);
  // In real: check Inventory.onHand - reserved >= qty via Mongo transaction
  await redisClient.setEx(key, ttlSec, String(qty));
  return { ok:true, expiresAt: new Date(Date.now()+ttlSec*1000) };
}
export async function releaseStock(sku){
  await redisClient.del(`reserve:${sku}`);
}
