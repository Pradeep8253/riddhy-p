import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Address } from '@/models/index';
import { getSession } from '@/lib/auth';
import { addressSchema } from '@/lib/validators';
import { ok, fail, jsonBody } from '@/lib/http';
export async function PATCH(request,{params}){const session=await getSession();if(!session)return fail('Sign in to update an address.',401);const {id}=await params;const schema=addressSchema.partial().extend({isDefault:z.boolean().optional()});const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Address update is invalid.',400,parsed.error.flatten());try{await connectDB();if(parsed.data.isDefault)await Address.updateMany({userId:session.sub},{$set:{isDefault:false}});const address=await Address.findOneAndUpdate({_id:id,userId:session.sub},{$set:parsed.data},{new:true}).lean();return address?ok({...address,id:String(address._id),_id:undefined}):fail('Address not found.',404)}catch(error){return fail(error.message,400)}}
export async function DELETE(_request,{params}){const session=await getSession();if(!session)return fail('Sign in to remove an address.',401);const {id}=await params;try{await connectDB();const deleted=await Address.findOneAndDelete({_id:id,userId:session.sub});return deleted?ok({deleted:true}):fail('Address not found.',404)}catch{return fail('Unable to remove address.',500)}}
