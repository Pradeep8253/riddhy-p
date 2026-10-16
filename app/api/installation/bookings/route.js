import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Installation, Order } from '@/models/index';
import { getSession } from '@/lib/auth';
import { checkServiceability } from '@/lib/serviceability';
import { ok, fail, jsonBody } from '@/lib/http';
const schema=z.object({orderId:z.string().min(1),itemSku:z.string().min(1),pincode:z.string().regex(/^\d{6}$/),slotAt:z.coerce.date(),notes:z.string().max(300).optional()});
export async function GET(){
  const session=await getSession();if(!session)return fail('Sign in to view installation bookings.',401);
  try{await connectDB();const orders=await Order.find({userId:session.sub}).select('_id').lean();const bookings=await Installation.find({orderId:{$in:orders.map((order)=>order._id)}}).sort({slotAt:1}).limit(50).lean();return ok(bookings.map((booking)=>({...booking,id:String(booking._id),_id:undefined})))}catch{return fail('Unable to load installation bookings.',500)}
}
export async function POST(request){
  const session=await getSession();if(!session)return fail('Sign in to book an installation.',401);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Installation booking details are incomplete.',400,parsed.error.flatten());
  const {orderId,itemSku,pincode,slotAt,notes}=parsed.data;const service=checkServiceability(pincode);
  if(!service.serviceable)return fail(service.message,409);
  if(slotAt<new Date(Date.now()+24*3600000)||slotAt>new Date(Date.now()+30*86400000))return fail('Choose a slot between tomorrow and the next 30 days.',400);
  try{
    await connectDB();const order=await Order.findOne({_id:orderId,userId:session.sub});
    if(!order)return fail('Order does not belong to this account.',403);
    if(!['delivered','installation_scheduled','installed','completed'].includes(order.status))return fail('Choose an installation slot after delivery has been scheduled or completed.',409);
    if(!order.items.some((item)=>item.sku===itemSku))return fail('This SKU is not part of the order.',400);
    const booking=await Installation.create({orderId:order._id,itemSku,pincode,slotAt,status:'booked',notes});
    if(order.status==='delivered')order.status='installation_scheduled';
    order.timeline.push({status:'installation_scheduled',at:new Date(),note:`Installation slot requested for ${slotAt.toLocaleDateString('en-IN')}.`,by:session.sub});await order.save();
    return ok({id:String(booking._id),status:booking.status,slotAt:booking.slotAt},201);
  }catch(error){return fail(error.message,400)}
}
