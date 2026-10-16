import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ProductRegistration, WarrantyPolicy, WarrantyExtension } from '@/models/index';
import { getSession } from '@/lib/auth';
import { ok, fail, jsonBody } from '@/lib/http';
const schema=z.object({registrationId:z.string().min(1),years:z.number().int().min(1).max(3)});
export async function POST(request){
  const session=await getSession();if(!session)return fail('Sign in to review warranty extension options.',401);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Warranty extension request is invalid.',400);
  try{
    await connectDB();const registration=await ProductRegistration.findOne({_id:parsed.data.registrationId,userId:session.sub});
    if(!registration)return fail('Registered product not found.',404);
    if(registration.expiryDate&&registration.expiryDate<new Date())return fail('This warranty has expired. Contact support to review service options.',409);
    const policy=await WarrantyPolicy.findOne({source:'extended',active:true}).sort({durationDays:-1}).lean();
    if(!policy||!policy.extensionPriceInr)return fail('Extended protection is not configured for this product.',409);
    let requestRecord=await WarrantyExtension.findOne({registrationId:registration._id,userId:session.sub,status:{$in:['requested','quoted','paid','active']}});
    if(!requestRecord)requestRecord=await WarrantyExtension.create({userId:session.sub,registrationId:registration._id,years:parsed.data.years,quotedAmount:policy.extensionPriceInr*parsed.data.years,status:'requested',policyVersion:policy.policyVersion});
    return ok({id:String(requestRecord._id),status:requestRecord.status,years:requestRecord.years,amountInr:requestRecord.quotedAmount,currency:'INR',message:'Your extension request is saved. Cover activates only after the final terms and payment are confirmed.'},201);
  }catch(error){return fail(error.message,400)}
}
