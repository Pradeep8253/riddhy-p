import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import { User } from '@/models/index';
import { ok,fail,jsonBody } from '@/lib/http';
const updateSchema=z.object({name:z.string().trim().min(2).max(80),phone:z.string().trim().optional().or(z.literal(''))});
export async function GET(){const session=await getSession();if(!session)return fail('Sign in to view your account.',401);try{await connectDB();const user=await User.findById(session.sub).select('name email phone role createdAt').lean();return user?ok({...user,id:String(user._id),_id:undefined}):fail('Account not found.',404)}catch{return fail('Unable to load account.',500)}}
export async function PATCH(request){
  const session=await getSession();if(!session)return fail('Sign in to update your account.',401);
  const parsed=updateSchema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Profile details are invalid.',400,parsed.error.flatten());
  const digits=String(parsed.data.phone||'').replace(/\D/g,'');const phone=digits?digits.slice(-10):'';if(phone&&!/^[6-9]\d{9}$/.test(phone))return fail('Enter a valid 10-digit Indian mobile number.',400);
  try{await connectDB();const update={$set:{name:parsed.data.name}};if(phone)update.$set.phone=phone;else update.$unset={phone:1};const profile=await User.findByIdAndUpdate(session.sub,update,{new:true,runValidators:true}).select('name email phone role createdAt').lean();return profile?ok({...profile,id:String(profile._id),_id:undefined}):fail('Account not found.',404)}catch(error){return fail(error.code===11000?'This phone number is already linked to another account.':error.message,400)}
}
