import { connectDB } from '@/lib/db';
import { Address } from '@/models/index';
import { getSession } from '@/lib/auth';
import { addressSchema } from '@/lib/validators';
import { ok, fail, jsonBody } from '@/lib/http';
export async function GET(){const session=await getSession();if(!session)return fail('Sign in to view saved addresses.',401);try{await connectDB();const addresses=await Address.find({userId:session.sub}).sort({isDefault:-1,createdAt:-1}).lean();return ok(addresses.map((address)=>({...address,id:String(address._id),_id:undefined})))}catch{return fail('Unable to load addresses.',500)}}
export async function POST(request){const session=await getSession();if(!session)return fail('Sign in to save an address.',401);const parsed=addressSchema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Address details are incomplete.',400,parsed.error.flatten());try{await connectDB();const isFirst=!(await Address.exists({userId:session.sub}));const address=await Address.create({...parsed.data,userId:session.sub,isDefault:isFirst});return ok({id:String(address._id),...parsed.data,isDefault:address.isDefault},201)}catch(error){return fail(error.message,400)}}
