const buckets = new Map();
export function rateLimit(key, { limit = 40, windowMs = 60000 } = {}) {
  const now=Date.now();let bucket=buckets.get(key);
  if(!bucket||bucket.resetAt<=now){bucket={count:0,resetAt:now+windowMs};buckets.set(key,bucket)}
  bucket.count+=1;
  return { allowed:bucket.count<=limit, remaining:Math.max(0,limit-bucket.count), resetAt:bucket.resetAt };
}
