import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';
import { getSession } from '@/lib/auth';
import { ok, fail, jsonBody } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
const schema=z.object({resourceType:z.enum(['image','video']).default('image')});
export const runtime='nodejs';
export async function POST(request){
  const session=await getSession();if(!session)return fail('Sign in to upload claim media.',401);if(!rateLimit(`claim-upload:${session.sub}`,{limit:30,windowMs:60*60000}).allowed)return fail('Upload limit reached. Please try again later.',429);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Unsupported media type.',400);
  const cloudName=process.env.CLOUDINARY_CLOUD_NAME,apiKey=process.env.CLOUDINARY_API_KEY,apiSecret=process.env.CLOUDINARY_API_SECRET;
  if(!cloudName||!apiKey||!apiSecret)return fail('Claim media uploads are not configured. Add Cloudinary credentials to enable uploads.',503);
  const timestamp=Math.floor(Date.now()/1000),folder='rf-riddhy/warranty-claims';
  const params={folder,timestamp};
  const signature=cloudinary.utils.api_sign_request(params,apiSecret);
  return ok({cloudName,apiKey,folder,timestamp,signature,resourceType:parsed.data.resourceType,uploadUrl:`https://api.cloudinary.com/v1_1/${cloudName}/${parsed.data.resourceType}/upload`});
}
