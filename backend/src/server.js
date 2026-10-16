import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
dotenv.config();
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';
import { apiLimiter } from './middlewares/rateLimiter.js';
import { errorHandler } from './middlewares/errorHandler.js';
import catalogue from './routes/catalogue.js';
import cart from './routes/cart.js';
import payments from './routes/payments.js';
import orders from './routes/orders.js';
import warranty from './routes/warranty.js';
import cms from './routes/cms.js';
import admin from './routes/admin.js';
import shipping from './routes/shipping.js';
import installation from './routes/installation.js';

const app=express();
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL?.split(',') || true, credentials:true }));
app.use(express.json({ limit:'2mb' }));
app.use(express.urlencoded({ extended:true }));
app.use(cookieParser());
app.use(morgan('tiny'));
app.use(apiLimiter);

app.get('/health', (req,res)=> res.json({ ok:true, time:new Date().toISOString() }));
app.use('/api/v1', catalogue);
app.use('/api/v1', cart);
app.use('/api/v1', payments);
app.use('/api/v1', orders);
app.use('/api/v1', warranty);
app.use('/api/v1', cms);
app.use('/api/v1', admin);
app.use('/api/v1', shipping);
app.use('/api/v1', installation);

// also support /api without version
app.use('/api', catalogue);
app.use('/api', cart);
app.use('/api', payments);

app.use(errorHandler);

const PORT=process.env.PORT||4000;
connectDB().then(()=> connectRedis().finally(()=>{
  app.listen(PORT,'0.0.0.0',()=> console.log(`Backend running on :${PORT}`));
}));
// Fallback if DB not available
if(process.env.SKIP_DB==='1'){
  app.listen(PORT,'0.0.0.0',()=> console.log(`Backend (no DB) on :${PORT}`));
}
