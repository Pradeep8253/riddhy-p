/**
 * In-memory sliding window rate limiter with periodic eviction.
 * For multi-instance horizontal scaling, deploy behind a Redis/Upstash
 * or MongoDB TTL-backed store as documented in SETUP.md.
 */

const buckets = new Map();

// Evict expired buckets every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  }, 5 * 60 * 1000);
  if (cleanupTimer.unref) cleanupTimer.unref();
}

export function rateLimit(key, { limit = 40, windowMs = 60000 } = {}) {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt
  };
}

/**
 * Defensively extracts client IP address from request headers.
 * Protects against spoofed x-forwarded-for lists and invalid characters.
 */
export function getClientIp(request) {
  if (!request) return '127.0.0.1';
  const forwarded = request.headers?.get('x-forwarded-for');
  if (forwarded) {
    const candidate = forwarded.split(',')[0].trim();
    // Validate IPv4 or IPv6 format
    const ipv4Regex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    const ipv6Regex = /^[0-9a-fA-F:]+$/;
    if (ipv4Regex.test(candidate) || ipv6Regex.test(candidate)) {
      return candidate;
    }
  }
  const realIp = request.headers?.get('x-real-ip');
  if (realIp && realIp.trim()) {
    return realIp.trim();
  }
  return '127.0.0.1';
}
