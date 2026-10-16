import crypto from 'crypto';
import { env } from '../config/env.js';
import { razorpay } from '../config/razorpay.js';
export async function createRazorpayOrder(amount, currency='INR', receipt){
  // amount in paise
  const order=await razorpay.orders.create({ amount: Math.round(amount*100), currency, receipt });
  return order;
}
export function verifySignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }){
  const hmac=crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
  hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
  const digest=hmac.digest('hex');
  return digest===razorpay_signature;
}
export function verifyWebhookSignature(body, signature){
  const hmac=crypto.createHmac('sha256', env.RAZORPAY_KEY_SECRET);
  hmac.update(JSON.stringify(body));
  return hmac.digest('hex')===signature;
}
