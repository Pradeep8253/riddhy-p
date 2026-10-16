import { getProducts } from '@/lib/catalogue';
import { ok, fail, apiError } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';
export async function GET(request){const url=new URL(request.url),q=(url.searchParams.get('q')||'').trim(),ip=request.headers.get('x-forwarded-for')||'unknown';if(!q)return ok([]);if(q.length>100)return fail('Search phrase is too long.',400);if(!rateLimit(`search:${ip}`,{limit:35,windowMs:60000}).allowed)return fail('Too many searches. Please try again shortly.',429);try{const result=await getProducts({q,limit:12});return ok(result.items,200,{query:q,total:result.total})}catch(error){return apiError(error)}}
