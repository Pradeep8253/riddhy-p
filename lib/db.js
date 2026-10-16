import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) console.warn('MONGODB_URI is not set. Database-backed routes will return a configuration error.');

let cache = globalThis.__rfMongoose;
if (!cache) cache = globalThis.__rfMongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cache.conn) return cache.conn;
  if (!MONGODB_URI) throw new Error('Database is not configured. Add MONGODB_URI to .env.');
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false, maxPoolSize: 10 }).then((instance) => instance);
  }
  try { cache.conn = await cache.promise; }
  catch (error) { cache.promise = null; throw error; }
  return cache.conn;
}
