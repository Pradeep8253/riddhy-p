import { checkoutQuoteSchema } from '@/lib/validators';
import { ok, fail, jsonBody } from '@/lib/http';
import { buildServerQuote } from '@/lib/checkout';
import { rateLimit } from '@/lib/rate-limit';
export async function POST(request){const ip=request.headers.get('x-forwarded-for')||'unknown';if(!rateLimit(`quote:${ip}`,{limit:18,windowMs:60000}).allowed)return fail('Too many checkout quotes. Please try again shortly.',429);const body=await jsonBody(request),parsed=checkoutQuoteSchema.safeParse(body);if(!parsed.success)return fail('Please check your cart and pincode.',400,parsed.error.flatten());try{return ok(await buildServerQuote(parsed.data))}catch(error){return fail(error.message,400)}}
