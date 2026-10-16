import { createRazorpayOrder, verifySignature } from '../services/paymentService.js';
import { checkIdempotency, saveIdempotency } from '../utils/idempotency.js';
export async function createOrder(req,res,next){
  try{
    const key=req.headers['idempotency-key'];
    if(key){ const { duplicate, result }=await checkIdempotency(key); if(duplicate) return res.json(result); }
    // validate amount server-side
    const { amount }=req.body;
    if(!amount) return res.status(400).json({error:'Amount required'});
    const order=await createRazorpayOrder(amount, 'INR', `rcpt_${Date.now()}`);
    const result={ data: order };
    if(key) await saveIdempotency(key, result);
    res.json(result);
  }catch(e){ next(e); }
}
export async function verify(req,res,next){
  try{
    const ok=verifySignature(req.body);
    if(!ok) return res.status(400).json({error:'Invalid signature'});
    res.json({ ok:true, message:'Payment verified' });
  }catch(e){ next(e); }
}
export async function webhook(req,res,next){
  try{
    // verify signature
    res.json({ ok:true });
  }catch(e){ next(e); }
}
