import { z } from 'zod';
import { ok, fail, jsonBody } from '@/lib/http';
import { pincodeSchema } from '@/lib/validators';
import { checkServiceability } from '@/lib/serviceability';
const schema=z.object({pincode:pincodeSchema});
export async function POST(request){const body=await jsonBody(request),parsed=schema.safeParse(body);if(!parsed.success)return fail('A valid pincode is required.',400);const service=checkServiceability(parsed.data.pincode);if(!service.serviceable)return ok({available:false,slots:[],message:service.message});const slots=Array.from({length:7},(_,index)=>{const date=new Date();date.setDate(date.getDate()+index+3);date.setHours(10,0,0,0);return {date:date.toISOString(),windows:['10:00–13:00','14:00–18:00']}});return ok({available:true,slots,message:'Sample time windows; final slot depends on item and pincode.'})}
