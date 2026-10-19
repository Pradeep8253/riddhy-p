import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ProductRegistration, WarrantyClaim, ClaimEvent } from '@/models/index';
import { getSession } from '@/lib/auth';
import { claimSchema } from '@/lib/validators';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
export async function GET(){const session=await getSession();if(!session)return fail('Sign in to view service claims.',401);try{await connectDB();const claims=await WarrantyClaim.find({userId:session.sub}).sort({createdAt:-1}).lean();return ok(claims.map((claim)=>({...claim,id:String(claim._id),_id:undefined})))}catch(error){return fail('Unable to load claims.',500)}}
export async function POST(request){
  const session=await getSession();
  if(!session)return fail('Sign in to request warranty service.',401);
  const ip=getClientIp(request);
  if(!rateLimit(`claim:user:${session.sub}`,{limit:6,windowMs:3600000}).allowed||!rateLimit(`claim:ip:${ip}`,{limit:12,windowMs:3600000}).allowed){
    return fail('Too many service claim submissions. Please wait a while before submitting another.',429);
  }
  const schema=claimSchema.extend({media:z.array(z.string().url()).max(6).optional()});const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Claim details are incomplete.',400,parsed.error.flatten());try{await connectDB();const registration=await ProductRegistration.findOne({_id:parsed.data.productRegistrationId,userId:session.sub});if(!registration)return fail('Registered product not found.',404);if(new Date(registration.expiryDate)<new Date())return fail('This product registration is outside its listed coverage period.',409);const claim=await WarrantyClaim.create({userId:session.sub,registrationId:registration._id,orderId:registration.orderId,issue:parsed.data.issue,media:parsed.data.media||[],preferredContact:parsed.data.preferredContact,status:'submitted'});await ClaimEvent.create({claimId:claim._id,status:'submitted',note:'Claim submitted by customer.'});return ok({id:String(claim._id),status:claim.status,createdAt:claim.createdAt},201)}catch(error){return fail(error.message,400)}}
