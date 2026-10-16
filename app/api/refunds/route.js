import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Order, Payment, Refund, AuditLog } from '@/models/index';
import { getRazorpay } from '@/lib/razorpay';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';
const schema=z.object({orderId:z.string().min(1),amount:z.number().positive().optional(),reason:z.string().min(5).max(300),idempotencyKey:z.string().min(16).max(100).optional()});
export async function POST(request){
  const actor=await requireAdmin(new Set(['admin','super-admin','finance']));if(!actor)return fail('Admin permission required.',403);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Refund request is invalid.',400,parsed.error.flatten());
  let record=null,reserved=false;
  try{
    await connectDB();const key=parsed.data.idempotencyKey||randomUUID();
    const existing=await Refund.findOne({idempotencyKey:key});if(existing)return ok({id:String(existing._id),providerRefundId:existing.providerRefundId,status:existing.status,amount:existing.amount},existing.status==='requested'?202:200);
    const order=await Order.findById(parsed.data.orderId);if(!order)return fail('Order not found.',404);
    const payment=await Payment.findOne({orderId:order._id,status:'captured'});if(!payment?.providerPaymentId)return fail('No captured payment is available for refund.',409);
    const remaining=Math.max(0,Math.round((order.total-Number(order.refundedAmount||0))*100)/100),amount=parsed.data.amount??remaining;
    if(amount<=0)return fail('There is no refundable balance remaining.',409);
    if(amount>remaining)return fail(`Refund exceeds the remaining balance of ₹${remaining.toLocaleString('en-IN')}.`,400);
    record=await Refund.create({orderId:order._id,paymentId:payment._id,idempotencyKey:key,amount,status:'requested',reason:parsed.data.reason,requestedBy:actor.sub});
    const reservedOrder=await Order.findOneAndUpdate({_id:order._id,refundedAmount:{$lte:order.total-amount}},{$inc:{refundedAmount:amount},$set:{paymentStatus:'partially_refunded'}},{new:true});
    if(!reservedOrder){record.status='failed';await record.save();return fail('Another refund request used the remaining refundable balance. Refresh and retry.',409)}
    reserved=true;
    const providerRefund=await getRazorpay().payments.refund(payment.providerPaymentId,{amount:Math.round(amount*100),notes:{reason:parsed.data.reason,orderNumber:order.orderNumber,requestId:String(record._id)}});
    record.providerRefundId=providerRefund.id;record.status=providerRefund.status==='processed'?'processed':'requested';await record.save();
    if(record.status==='processed'&&reservedOrder.refundedAmount>=order.total)await Order.updateOne({_id:order._id},{$set:{paymentStatus:'refunded',status:'refunded'}});
    await AuditLog.create({actorId:actor.sub,actorEmail:actor.email,action:'refund.processed',entity:'Order',entityId:String(order._id),after:{refundId:String(record._id),amount,status:record.status}});
    return ok({id:String(record._id),refundId:providerRefund.id,status:providerRefund.status,amount},201);
  }catch(error){
    if(error.code===11000){const key=parsed.data.idempotencyKey;if(key){const existing=await Refund.findOne({idempotencyKey:key}).catch(()=>null);if(existing)return ok({id:String(existing._id),providerRefundId:existing.providerRefundId,status:existing.status,amount:existing.amount},existing.status==='requested'?202:200)}return fail('A refund request already exists. Check its status before retrying.',409)}
    if(record&&!record.providerRefundId){record.status='failed';await record.save().catch(()=>{});if(reserved){const order=await Order.findById(record.orderId).catch(()=>null);await Order.updateOne({_id:record.orderId,refundedAmount:{$gte:record.amount}},{$inc:{refundedAmount:-record.amount}}).catch(()=>{});const fresh=await Order.findById(record.orderId).catch(()=>null);if(fresh)await Order.updateOne({_id:record.orderId},{$set:{paymentStatus:Number(fresh.refundedAmount||0)>0?'partially_refunded':'paid'}}).catch(()=>{});}}
    return fail(process.env.NODE_ENV==='production'?'Refund could not be completed.':error.message,502);
  }
}
