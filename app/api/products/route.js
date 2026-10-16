import { getProducts } from '@/lib/catalogue';
import { ok, fail, apiError, clampLimit, clampPage } from '@/lib/http';
import { rateLimit } from '@/lib/rate-limit';

export async function GET(request) {
  const url=new URL(request.url),ip=request.headers.get('x-forwarded-for')||'unknown';
  if(!rateLimit(`products:${ip}`,{limit:90}).allowed)return fail('Too many requests. Please slow down.',429);
  try {
    const page=clampPage(url.searchParams.get('page')),limit=clampLimit(url.searchParams.get('limit'));
    const result=await getProducts({type:url.searchParams.get('type')||undefined,category:url.searchParams.get('category')||undefined,q:url.searchParams.get('q')||undefined,minPrice:url.searchParams.get('minPrice')||undefined,maxPrice:url.searchParams.get('maxPrice')||undefined,sort:url.searchParams.get('sort')||'featured',page,limit});
    return ok(result.items,200,{page:result.page,limit:result.limit,total:result.total,pages:result.pages});
  } catch(error) { return apiError(error); }
}
