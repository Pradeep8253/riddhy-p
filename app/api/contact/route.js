import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Lead } from '@/models/index';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { sendMail } from '@/lib/mailer';
const schema=z.object({name:z.string().min(2).max(100),email:z.string().email(),phone:z.string().regex(/^[6-9]\d{9}$/),message:z.string().min(10).max(2500)});
export async function POST(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  if(!rateLimit(`contact:${ip}`,{limit:5,windowMs:3600000}).allowed)return fail('Please wait before sending another message.',429);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Please check your contact details.',400,parsed.error.flatten());
  try{
    const {name,email,phone,message}=parsed.data;let lead=null,emailed=false;
    if(process.env.MONGODB_URI){await connectDB();lead=await Lead.create({kind:'contact',name,email:email.toLowerCase(),phone,message,status:'new',source:'website',ip})}
    try{const result=await sendMail({to:process.env.SMTP_FROM||'support@riddhy.in',subject:`Website enquiry from ${name}`,text:`${name} (${email}, ${phone})\n\n${message}`});emailed=!result.skipped;if(lead&&emailed)await Lead.updateOne({_id:lead._id},{$set:{emailSent:true}})}catch(error){console.warn('Contact lead email delivery failed:',error.message)}
    if(!lead&&!emailed)return ok({received:false,demoOnly:true,message:'This demo has no CRM database or SMTP configured, so the enquiry was not stored or sent.'});
    return ok({received:true,persisted:Boolean(lead),emailed,message:lead?'Thank you. Your enquiry has been saved for the Riddhy team.':'Thank you. Your enquiry has been emailed to the Riddhy team.'},201);
  }catch(error){return fail(process.env.NODE_ENV==='production'?'Unable to save your enquiry right now.':error.message,503)}
}
