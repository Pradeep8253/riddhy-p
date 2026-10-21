import mongoose from "mongoose";

let cache = globalThis.__rfMongoose;
if (!cache) cache = globalThis.__rfMongoose = { conn: null, promise: null };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || "rf-riddhy";

  if (cache.conn) return cache.conn;
  if (!uri) throw new Error("Database is not connected.");
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        dbName,
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
      })
      .then((instance) => instance);
  }
  try {
    cache.conn = await cache.promise;
  } catch (error) {
    cache.promise = null;
    throw error;
  }
  return cache.conn;
}
