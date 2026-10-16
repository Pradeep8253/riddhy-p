import { z } from 'zod';
import { ok, fail, jsonBody } from '@/lib/http';
import { pincodeSchema } from '@/lib/validators';
import { checkServiceability } from '@/lib/serviceability';
import { rateLimit } from '@/lib/rate-limit';
const schema=z.object({pincode:pincodeSchema});
export async function POST(request){const ip=request.headers.get('x-forwarded-for')||'unknown';if(!rateLimit(`pin:${ip}`,{limit:12,windowMs:60000}).allowed)return fail('Too many pincode checks. Try again in a minute.',429);const body=await jsonBody(request),parsed=schema.safeParse(body);if(!parsed.success)return fail('Enter a valid 6-digit pincode.',400,parsed.error.flatten());return ok(checkServiceability(parsed.data.pincode))}
