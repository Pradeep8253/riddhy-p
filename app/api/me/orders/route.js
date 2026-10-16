import { connectDB } from '@/lib/db';
import { Order } from '@/models/index';
import { getSession } from '@/lib/auth';
import { ok, fail, apiError } from '@/lib/http';
export async function GET(){const session=await getSession();if(!session)return fail('Sign in to view your orders.',401);try{await connectDB();const orders=await Order.find({userId:session.sub}).sort({createdAt:-1}).select('orderNumber status paymentStatus total currency items shippingAddress timeline createdAt deliveredAt installedAt').lean();return ok(orders.map((order)=>({...order,id:String(order._id),_id:undefined})))}catch(error){return apiError(error)}}
