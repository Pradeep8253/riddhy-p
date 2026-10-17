import mongoose from 'mongoose';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Order, Payment, Reservation, Inventory } from '@/models/index';
import { getRazorpay } from '@/lib/razorpay';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

const schema=z.object({orderId:z.string().min(1),razorpay_order_id:z.string().min(1),razorpay_payment_id:z.string().min(1),razorpay_signature:z.string().min(1)});
function equalHex(left,right){try{const a=Buffer.from(left,'hex'),b=Buffer.from(right,'hex');return a.length===b.length&&timingSafeEqual(a,b)}catch{return false}}

export async function POST(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();if(!rateLimit(`payment-verify:${ip}`,{limit:30,windowMs:15*60000}).allowed)return fail('Too many payment verification attempts.',429);
  if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)return fail('Online payment verification is not configured.',503);
  const parsed=schema.safeParse(await jsonBody(request));
  if(!parsed.success)return fail('Payment verification details are incomplete.',400);
  let session;
  try{
    await connectDB();const data=parsed.data;const order=await Order.findById(data.orderId);
    if(!order)return fail('Order not found.',404);
    const payment=await Payment.findOne({orderId:order._id,providerOrderId:data.razorpay_order_id});
    if(!payment)return fail('Payment order does not match this checkout.',400);
    const expected=createHmac('sha256',process.env.RAZORPAY_KEY_SECRET||'').update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`).digest('hex');
    if(!equalHex(expected,data.razorpay_signature))return fail('Payment signature could not be verified.',400);
    const providerPayment=await getRazorpay().payments.fetch(data.razorpay_payment_id);
    if(providerPayment.order_id!==data.razorpay_order_id)return fail('Payment was created for a different gateway order.',400);
    if(Number(providerPayment.amount)!==Math.round(order.total*100))return fail('Payment amount does not match the order.',400);
    if(providerPayment.status!=='captured'){
      payment.providerPaymentId=data.razorpay_payment_id;payment.signature=data.razorpay_signature;payment.method=providerPayment.method;payment.status=providerPayment.status==='authorized'?'authorized':'failed';await payment.save();
      if(providerPayment.status==='failed')await Order.updateOne({_id:order._id,paymentStatus:{$ne:'paid'}},{$set:{paymentStatus:'failed',status:'payment_failed'},$push:{timeline:{status:'payment_failed',at:new Date(),note:'Razorpay reported a failed payment.'}}});
      return ok({verified:true,paid:false,paymentStatus:payment.status,message:'Payment is not captured yet. The order remains unpaid until capture confirmation.'});
    }
    session=await mongoose.startSession();let alreadyPaid=false;
    await session.withTransaction(async()=>{
      const freshOrder=await Order.findById(order._id).session(session);
      const freshPayment=await Payment.findOne({orderId:order._id,providerOrderId:data.razorpay_order_id}).session(session);
      if(!freshOrder||!freshPayment)throw new Error('Checkout record is no longer available.');
      freshPayment.providerPaymentId=data.razorpay_payment_id;freshPayment.signature=data.razorpay_signature;freshPayment.method=providerPayment.method;freshPayment.status='captured';await freshPayment.save({session});
      if(freshOrder.paymentStatus==='paid'){alreadyPaid=true;return;}
      await Order.updateOne({_id:freshOrder._id,paymentStatus:{$ne:'paid'}},{$set:{paymentStatus:'paid',status:'confirmed'},$push:{timeline:{status:'paid',at:new Date(),note:'Payment verified by signed Razorpay checkout response.'}}},{session});
      const reservations=await Reservation.find({orderId:freshOrder._id,status:'active'}).session(session).lean();
      for(const reservation of reservations){const stock=await Inventory.updateOne({variantId:reservation.variantId,warehouseId:reservation.warehouseId,reserved:{$gte:reservation.qty}},{$inc:{reserved:-reservation.qty}},{session});if(!stock.matchedCount)throw new Error(`Reserved stock is inconsistent for ${reservation._id}.`)}
      await Reservation.updateMany({orderId:freshOrder._id,status:'active'},{$set:{status:'consumed',purgeAt:new Date(Date.now()+7*86400000)}},{session});
    });
    return ok({verified:true,paid:true,alreadyPaid,orderNumber:order.orderNumber});
  }catch(error){
    console.error('Payment verification failed:',error.message);
    if(error.message.includes('replica set')||error.message.includes('Transaction numbers'))return fail('Payment was verified, but database transaction could not complete. Please contact support.',503);
    return fail('Could not verify payment. The order remains unpaid until a verified capture is received.',502);
  }finally{await session?.endSession()}
}
