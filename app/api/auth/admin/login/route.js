import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { AdminUser } from '@/models/index';
import { signSession,verifyPassword,SESSION_COOKIE,sessionCookieOptions } from '@/lib/auth';
import { ok,fail,jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
const schema=z.object({email:z.string().email(),password:z.string().min(8).max(128)});
export async function POST(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  if(!rateLimit(`admin-login:${ip}`,{limit:6,windowMs:15*60000}).allowed)return fail('Too many admin sign-in attempts. Try again in 15 minutes.',429);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Enter a valid email and password.',400);
  try{await connectDB();const admin=await AdminUser.findOne({email:parsed.data.email.toLowerCase(),active:true});if(!admin||!await verifyPassword(parsed.data.password,admin.passwordHash))return fail('Email or password is incorrect.',401);admin.lastLoginAt=new Date();await admin.save();const token=await signSession(admin);const response=ok({id:String(admin._id),name:admin.name,email:admin.email,role:admin.role});response.cookies.set(SESSION_COOKIE,token,sessionCookieOptions());return response}catch(error){return fail(process.env.NODE_ENV==='production'?'Sign in is temporarily unavailable.':error.message,503)}
}
