import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { ok, fail } from '@/lib/http';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbConnected = false;
  let dbLatencyMs = null;

  try {
    if (process.env.MONGODB_URI) {
      await connectDB();
      const dbStart = Date.now();
      const adminDb = mongoose.connection.db?.admin?.();
      if (adminDb) {
        await adminDb.ping();
      }
      dbLatencyMs = Date.now() - dbStart;
      dbConnected = mongoose.connection.readyState === 1;
    }
  } catch (err) {
    dbConnected = false;
  }

  const mem = process.memoryUsage();
  const healthData = {
    status: dbConnected || !process.env.MONGODB_URI ? 'healthy' : 'degraded',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
    database: {
      connected: dbConnected,
      readyState: mongoose.connection.readyState,
      latencyMs: dbLatencyMs
    },
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024)
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0'
  };

  return ok(healthData);
}
