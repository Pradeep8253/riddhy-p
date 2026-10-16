import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { ProductRegistration, Product, Variant, Order, WarrantyPolicy } from '@/models/index';
import { getSession } from '@/lib/auth';
import { ok, fail, jsonBody } from '@/lib/http';
const schema=z.object({sku:z.string().min(2),serialNumber:z.string().trim().min(4).max(80),activationDate:z.coerce.date(),source:z.enum(['manufacturer','seller']).default('seller'),orderNumber:z.string().trim().optional(),offlinePurchase:z.boolean().default(false)});
export async function POST(request){
  const session=await getSession();if(!session)return fail('Sign in to register a product.',401);
  const parsed=schema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Registration details are incomplete.',400,parsed.error.flatten());
  try{
    await connectDB();const {sku,serialNumber,activationDate,source,orderNumber,offlinePurchase}=parsed.data;
    if(activationDate>new Date())return fail('Warranty activation date cannot be in the future.',400);
    if(!orderNumber&&!offlinePurchase)return fail('Add an order number, or choose offline purchase registration.',400);
    if(orderNumber&&offlinePurchase)return fail('Choose either an order number or offline purchase registration.',400);
    const variant=await Variant.findOne({sku,active:true});if(!variant)return fail('SKU not found.',404);
    const product=await Product.findById(variant.productId);if(!product)return fail('Product not found.',404);
    let order=null;
    if(orderNumber){order=await Order.findOne({orderNumber:orderNumber.toUpperCase(),userId:session.sub});if(!order)return fail('Order does not belong to this account.',403);if(!order.items.some((item)=>item.sku===sku))return fail('This SKU is not part of the order.',400);if(!['confirmed','processing','packed','ready_for_dispatch','shipped','out_for_delivery','delivered','installation_scheduled','installed','completed'].includes(order.status))return fail('Product registration opens after order confirmation.',409)}
    const policy=await WarrantyPolicy.findOne({source,active:true}).sort({durationDays:-1}).lean();if(!policy?.durationDays)return fail('Warranty terms for this product are not configured.',409);
    const expiryDate=new Date(activationDate);expiryDate.setDate(expiryDate.getDate()+policy.durationDays);
    const record=await ProductRegistration.create({userId:session.sub,orderId:order?._id,productId:product._id,variantId:variant._id,sku,serialNumber,activationDate,expiryDate,source,policyVersion:policy.policyVersion,registeredFrom:offlinePurchase?'offline':'order'});
    return ok({id:String(record._id),sku,activationDate,expiryDate,daysRemaining:policy.durationDays,policyVersion:policy.policyVersion},201);
  }catch(error){return fail(error.code===11000?'This serial number is already registered.':error.message,400)}
}
