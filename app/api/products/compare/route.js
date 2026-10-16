import { getCatalogue } from '@/lib/catalogue';
import { ok, fail } from '@/lib/http';
export async function GET(request){const slugs=(new URL(request.url).searchParams.get('slugs')||'').split(',').filter(Boolean);if(slugs.length>4)return fail('Compare up to four products.',400);const all=await getCatalogue();return ok(slugs.map((slug)=>all.find((product)=>product.slug===slug)).filter(Boolean))}
