import { getCategories } from '@/lib/catalogue';
import { ok, apiError } from '@/lib/http';
export async function GET(request){try{const type=new URL(request.url).searchParams.get('type')||undefined;return ok(await getCategories(type));}catch(error){return apiError(error)}}
