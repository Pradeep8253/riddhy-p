import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Order,Payment,Reservation } from '@/models/index';
import { getRazorpay } from '@/lib/razorpay';
import { ok,fail,jsonBody } from '@/lib/http';
import { getSession } from '@/lib/auth';
import { releaseExpiredReservations } from '@/lib/inventory';
import { rateLimit } from '@/lib/rate-limit';
const schema=z.object({orderId:z.string().min(1),email:z.string().email()});
function toResponse(payment,order){return {keyId:process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID||process.env.RAZORPAY_KEY_ID,razorpayOrderId:payment.providerOrderId,amount:Math.round(order.total*100),currency:'INR',orderId:String(order._id),orderNumber:order.orderNumber,customer:{name:order.shippingAddress?.name,email:order.email,contact:order.phone},reused:Boolean(payment.reused)}}
export async function POST(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();if(!rateLimit(`payment-create:${ip}`,{limit:10,windowMs:60*60000}).allowed)return fail('Too many payment attempts. Try again later.',429);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Order and email are required.',400);
  if(!process.env.RAZORPAY_KEY_ID||!process.env.RAZORPAY_KEY_SECRET)return fail('Online payment is not configured for this demo.',503);
  try{
    await connectDB();await releaseExpiredReservations();const order=await Order.findById(parsed.data.orderId);if(!order)return fail('Order not found.',404);
    const session=await getSession();if(order.userId&&String(order.userId)!==String(session?.sub))return fail('You cannot pay for this order.',403);
    if(String(order.email).toLowerCase()!==parsed.data.email.toLowerCase())return fail('Email does not match the order.',403);
    if(order.paymentStatus==='paid')return fail('This order is already paid.',409);
    if(!['reserved','payment_pending','payment_failed'].includes(order.status))return fail('This order is not ready for payment.',409);
    const activeReservation=await Reservation.exists({orderId:order._id,status:'active',expiresAt:{$gt:new Date()}});if(!activeReservation)return fail('The checkout reservation has expired. Return to your bag and create a new quote.',409);
    const prior=await Payment.findOne({orderId:order._id,status:'created',providerOrderId:{$exists:true}}).sort({createdAt:-1});if(prior)return ok(toResponse({...prior.toObject(),reused:true},order));
    const razorpayOrder=await getRazorpay().orders.create({amount:Math.round(order.total*100),currency:'INR',receipt:order.orderNumber,notes:{internalOrderId:String(order._id),orderNumber:order.orderNumber}});
    const payment=await Payment.create({orderId:order._id,provider:'razorpay',providerOrderId:razorpayOrder.id,amount:order.total,currency:'INR',status:'created'});
    order.status='payment_pending';order.paymentStatus='pending';await order.save();return ok(toResponse(payment,order));
  }catch(error){console.error('Razorpay order creation failed:',error.message);if(error.message.includes('replica set')||error.message.includes('Transaction numbers'))return fail('MongoDB transactions need a replica set.',503);return fail(process.env.NODE_ENV==='production'?'Unable to create payment order.':error.message,502)}
}
