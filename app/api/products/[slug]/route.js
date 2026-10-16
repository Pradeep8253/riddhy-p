import { getCatalogProduct } from '@/lib/catalogue';
import { ok, fail, apiError } from '@/lib/http';
export async function GET(_request,{params}) {
  try { const {slug}=await params;const product=await getCatalogProduct(slug);return product?ok(product):fail('Product not found.',404); }
  catch(error){return apiError(error)}
}
