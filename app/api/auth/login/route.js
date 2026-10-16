import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/index';
import { signSession,verifyPassword,SESSION_COOKIE,sessionCookieOptions } from '@/lib/auth';
import { ok,fail,jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
const schema=z.object({email:z.string().email(),password:z.string().min(8).max(128)});
export async function POST(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  if(!rateLimit(`login:${ip}`,{limit:8,windowMs:15*60000}).allowed)return fail('Too many sign-in attempts. Try again in 15 minutes.',429);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Enter a valid email and password.',400);
  try{await connectDB();const user=await User.findOne({email:parsed.data.email.toLowerCase(),active:true});if(!user||!user.passwordHash||!await verifyPassword(parsed.data.password,user.passwordHash))return fail('Email or password is incorrect.',401);const token=await signSession(user);const response=ok({id:String(user._id),name:user.name,email:user.email,role:user.role});response.cookies.set(SESSION_COOKIE,token,sessionCookieOptions());return response}catch(error){return fail(process.env.NODE_ENV==='production'?'Sign in is temporarily unavailable.':error.message,503)}
}
