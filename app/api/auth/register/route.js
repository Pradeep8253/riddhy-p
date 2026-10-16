import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/index';
import { hashPassword,signSession,SESSION_COOKIE,sessionCookieOptions } from '@/lib/auth';
import { ok,fail,jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
const schema=z.object({name:z.string().trim().min(2).max(100),email:z.string().email(),phone:z.string().regex(/^[6-9]\d{9}$/),password:z.string().min(8).max(128)});
export async function POST(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  if(!rateLimit(`register:${ip}`,{limit:5,windowMs:60*60000}).allowed)return fail('Too many account attempts. Try again later.',429);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Please check your details. Password must be at least 8 characters.',400,parsed.error.flatten());
  try{await connectDB();const email=parsed.data.email.toLowerCase();if(await User.exists({$or:[{email},{phone:parsed.data.phone}]}))return fail('An account already exists with this email or phone.',409);const user=await User.create({name:parsed.data.name,email,phone:parsed.data.phone,passwordHash:await hashPassword(parsed.data.password),role:'customer',active:true});const token=await signSession(user);const response=ok({id:String(user._id),name:user.name,email:user.email,role:user.role},201);response.cookies.set(SESSION_COOKIE,token,sessionCookieOptions());return response}catch(error){return fail(error.code===11000?'An account already exists with this email or phone.':error.message,400)}
}
