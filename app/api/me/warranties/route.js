import { connectDB } from '@/lib/db';
import { ProductRegistration } from '@/models/index';
import { getSession } from '@/lib/auth';
import { daysRemaining } from '@/lib/warranty';
import { ok, fail, apiError } from '@/lib/http';
export async function GET(){const session=await getSession();if(!session)return fail('Sign in to view your warranties.',401);try{await connectDB();const records=await ProductRegistration.find({userId:session.sub}).sort({expiryDate:1}).lean();return ok(records.map((record)=>({...record,id:String(record._id),daysRemaining:daysRemaining(record.expiryDate),_id:undefined})))}catch(error){return apiError(error)}}
