import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Cart } from '@/models/index';
import { getSession } from '@/lib/auth';
import { getDemoProducts } from '@/lib/demo-data';
import { ok, fail, jsonBody, apiError } from '@/lib/http';
const cartSchema=z.object({items:z.array(z.object({sku:z.string().min(1),qty:z.number().int().min(1).max(99)})).max(40)});
export async function GET(){const session=await getSession();if(!session)return ok({items:[],guest:true});try{await connectDB();const cart=await Cart.findOne({userId:session.sub}).lean();return ok({items:cart?.items||[],guest:false})}catch(error){return apiError(error)}}
export async function POST(request){const body=await jsonBody(request),parsed=cartSchema.safeParse(body);if(!parsed.success)return fail('Cart request is invalid.',400,parsed.error.flatten());const session=await getSession();if(!session)return fail('Please sign in to update your cart.',401);try{await connectDB();const cart=await Cart.findOneAndUpdate({userId:session.sub},{$set:{items:parsed.data.items.map((item)=>({...item,addedAt:new Date()}))}},{upsert:true,new:true,setDefaultsOnInsert:true}).lean();return ok({items:cart.items,guest:false})}catch(error){return apiError(error)}}
