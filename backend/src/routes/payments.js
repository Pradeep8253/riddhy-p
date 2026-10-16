import { Router } from 'express';
import { createOrder, verify, webhook } from '../controllers/paymentController.js';
const r=Router();
r.post('/payments/create-order', createOrder);
r.post('/payments/verify', verify);
r.post('/webhooks/razorpay', webhook);
r.post('/refunds', (req,res)=> res.json({ ok:true }));
export default r;
