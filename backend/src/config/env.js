import dotenv from 'dotenv'; dotenv.config();
export const env={
  PORT: process.env.PORT || 4000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://mongo:27017/rfriddhy',
  REDIS_URL: process.env.REDIS_URL || 'redis://redis:6379',
  JWT_SECRET: process.env.JWT_SECRET || 'rf-riddhy-super-secret',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_xxx',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'test_secret',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
