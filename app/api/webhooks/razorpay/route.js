import mongoose from 'mongoose';
import { createHmac,timingSafeEqual } from 'node:crypto';
import { connectDB } from '@/lib/db';
import { PaymentEvent,Payment,Order,Reservation,Inventory,Refund } from '@/models/index';
import { ok,fail } from '@/lib/http';

function verifySignature(body,signature){if(!process.env.RAZORPAY_WEBHOOK_SECRET||!signature)return false;const expected=createHmac('sha256',process.env.RAZORPAY_WEBHOOK_SECRET).update(body).digest();try{const actual=Buffer.from(signature,'hex');return actual.length===expected.length&&timingSafeEqual(actual,expected)}catch{return false}}

export async function POST(request){
  const raw=await request.text(),signature=request.headers.get('x-razorpay-signature'),eventId=request.headers.get('x-razorpay-event-id');
  if(!verifySignature(raw,signature))return fail('Invalid webhook signature.',401);
  let payload;try{payload=JSON.parse(raw)}catch{return fail('Invalid webhook payload.',400)}
  if(!eventId)return fail('Missing idempotency event id.',400);
  let session;
  try{
    await connectDB();
    const entity=payload.payload?.payment?.entity||payload.payload?.order?.entity||payload.payload?.refund?.entity;
    const paymentEntity=payload.payload?.payment?.entity;
    const providerOrderId=paymentEntity?.order_id||payload.payload?.order?.entity?.id;
    const providerPaymentId=paymentEntity?.id;
    let duplicate=false;
    session=await mongoose.startSession();
    await session.withTransaction(async()=>{
      let event=await PaymentEvent.findOne({eventId}).session(session);
      if(event?.processedAt){duplicate=true;return;}
      if(!event)[event]=await PaymentEvent.create([{provider:'razorpay',eventId,type:payload.event,payload,processedAt:null}],{session});

      if(['payment.captured','payment.failed'].includes(payload.event)){
        const conditions=[];if(entity?.order_id)conditions.push({providerOrderId:entity.order_id});if(entity?.id)conditions.push({providerPaymentId:entity.id});
        const payment=conditions.length?await Payment.findOne({$or:conditions}).session(session):null;
        if(!payment)throw new Error('No local payment record matches this signed webhook event.');
        if(entity?.amount!==undefined&&Number(entity.amount)!==Math.round(Number(payment.amount)*100))throw new Error('Webhook amount does not match the local payment record.');
        const order=await Order.findById(payment.orderId).session(session);if(!order)throw new Error('The local order for this payment no longer exists.');
        if(payload.event==='payment.captured'){
          payment.providerPaymentId=entity.id||payment.providerPaymentId;payment.status='captured';await payment.save({session});
          if(order.paymentStatus!=='paid'){
            await Order.updateOne({_id:order._id,paymentStatus:{$ne:'paid'}},{$set:{paymentStatus:'paid',status:'confirmed'},$push:{timeline:{status:'paid',at:new Date(),note:'Payment confirmed by Razorpay webhook.'}}},{session});
            const reservations=await Reservation.find({orderId:order._id,status:'active'}).session(session).lean();
            for(const reservation of reservations){const stock=await Inventory.updateOne({variantId:reservation.variantId,warehouseId:reservation.warehouseId,reserved:{$gte:reservation.qty}},{$inc:{reserved:-reservation.qty}},{session});if(!stock.matchedCount)throw new Error(`Reserved stock is inconsistent for ${reservation._id}.`)}
            await Reservation.updateMany({orderId:order._id,status:'active'},{$set:{status:'consumed',purgeAt:new Date(Date.now()+7*86400000)}},{session});
          }
        }else{
          payment.providerPaymentId=entity.id||payment.providerPaymentId;payment.status='failed';await payment.save({session});
          await Order.updateOne({_id:order._id,paymentStatus:{$ne:'paid'}},{$set:{paymentStatus:'failed',status:'payment_failed'},$push:{timeline:{status:'payment_failed',at:new Date(),note:'Payment failed according to Razorpay webhook.'}}},{session});
        }
      }else if(['refund.processed','refund.failed'].includes(payload.event)){
        const refund=entity?.id?await Refund.findOne({providerRefundId:entity.id}).session(session):null;
        if(!refund)throw new Error('No local refund record matches this signed webhook event.');
        const order=await Order.findById(refund.orderId).session(session);if(!order)throw new Error('The local order for this refund no longer exists.');
        if(payload.event==='refund.processed'){
          refund.status='processed';await refund.save({session});
          if(Number(order.refundedAmount||0)>=Number(order.total||0)){order.paymentStatus='refunded';order.status='refunded';await order.save({session})}
        }else if(refund.status==='requested'){
          refund.status='failed';await refund.save({session});
          await Order.updateOne({_id:order._id,refundedAmount:{$gte:refund.amount}},{$inc:{refundedAmount:-refund.amount}},{session});
          const refreshed=await Order.findById(order._id).session(session);if(refreshed){refreshed.paymentStatus=Number(refreshed.refundedAmount||0)>0?'partially_refunded':'paid';if(refreshed.status==='refunded')refreshed.status='completed';await refreshed.save({session})}
        }
      }
      await PaymentEvent.updateOne({eventId},{$set:{processedAt:new Date(),paymentId:providerPaymentId,orderId:providerOrderId}},{session});
    });
    return ok({received:true,duplicate});
  }catch(error){
    console.error('Razorpay webhook processing error:',error.message);
    if(error.code===11000)return fail('Duplicate webhook is still processing; provider should retry.',503);
    return fail('Webhook received but could not be processed; provider may retry.',500);
  }finally{await session?.endSession()}
}
