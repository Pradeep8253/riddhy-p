import { connectDB } from '@/lib/db';
import { Order } from '@/models/index';
import { ok,fail } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
export async function GET(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();if(!rateLimit(`order-status:${ip}`,{limit:15,windowMs:15*60000}).allowed)return fail('Too many status checks. Try again shortly.',429);
  const url=new URL(request.url),orderId=url.searchParams.get('orderId'),email=url.searchParams.get('email');if(!orderId||!email)return fail('Order id and email are required.',400);
  try{await connectDB();const order=await Order.findOne({_id:orderId,email:email.toLowerCase()}).select('orderNumber status paymentStatus total paymentMethod createdAt').lean();if(!order)return fail('Order could not be found.',404);return ok({orderNumber:order.orderNumber,status:order.status,paymentStatus:order.paymentStatus,paymentMethod:order.paymentMethod,total:order.total,confirmed:order.paymentStatus==='paid'||order.paymentMethod==='cod'&&order.status==='confirmed'})}catch{return fail('Unable to check the order status.',500)}
}
