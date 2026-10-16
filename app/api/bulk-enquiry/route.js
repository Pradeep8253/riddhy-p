import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Lead } from '@/models/index';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
import { sendMail } from '@/lib/mailer';
const schema=z.object({name:z.string().min(2).max(100),email:z.string().email(),phone:z.string().regex(/^[6-9]\d{9}$/),company:z.string().min(2).max(120),pincode:z.string().regex(/^\d{6}$/),quantity:z.coerce.number().int().min(1).max(10000),message:z.string().min(10).max(2500)});
export async function POST(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();
  if(!rateLimit(`bulk:${ip}`,{limit:4,windowMs:3600000}).allowed)return fail('Please wait before sending another enquiry.',429);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Please check the bulk enquiry details.',400,parsed.error.flatten());
  try{
    const data=parsed.data;let lead=null,emailed=false;
    if(process.env.MONGODB_URI){await connectDB();lead=await Lead.create({kind:'trade',name:data.name,email:data.email.toLowerCase(),phone:data.phone,company:data.company,pincode:data.pincode,quantity:data.quantity,message:data.message,status:'new',source:'website',ip})}
    try{const result=await sendMail({to:process.env.SMTP_FROM||'sales@riddhy.in',subject:`Bulk enquiry: ${data.company}`,text:`${data.name} · ${data.company}\n${data.email} · ${data.phone}\nPincode: ${data.pincode} · Approx quantity: ${data.quantity}\n\n${data.message}`});emailed=!result.skipped;if(lead&&emailed)await Lead.updateOne({_id:lead._id},{$set:{emailSent:true}})}catch(error){console.warn('Trade lead email delivery failed:',error.message)}
    if(!lead&&!emailed)return ok({received:false,demoOnly:true,message:'This demo has no CRM database or SMTP configured, so the enquiry was not stored or sent.'});
    return ok({received:true,persisted:Boolean(lead),emailed,message:lead?'Thank you. Your trade enquiry has been saved for the Riddhy team.':'Thank you. Your trade enquiry has been emailed to the Riddhy team.'},201);
  }catch(error){return fail(process.env.NODE_ENV==='production'?'Unable to save your enquiry right now.':error.message,503)}
}
