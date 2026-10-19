import mongoose from 'mongoose';
import { createHash,randomBytes } from 'node:crypto';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Order,Variant,Inventory,Reservation,StockMovement,Coupon,Product } from '@/models/index';
import { addressSchema,checkoutQuoteSchema } from '@/lib/validators';
import { getSession } from '@/lib/auth';
import { resolveCheckoutItems,getCoupon } from '@/lib/checkout';
import { quoteCart } from '@/lib/pricing';
import { estimateFees,checkServiceability } from '@/lib/serviceability';
import { ok,fail,jsonBody } from '@/lib/http';
import { releaseExpiredReservations } from '@/lib/inventory';
import { rateLimit } from '@/lib/rate-limit';

const reservationSchema=checkoutQuoteSchema.extend({
  address:addressSchema,
  email:z.string().email(),
  phone:z.string().regex(/^[6-9]\d{9}$/),
  notes:z.string().max(500).optional(),
  paymentMethod:z.enum(['razorpay','cod']).default('razorpay'),
  idempotencyKey:z.string().min(16).max(100).optional(),
  buyerGstin:z.string().trim().max(15).optional(),
  buyerBusinessName:z.string().trim().max(150).optional(),
  isB2B:z.boolean().optional()
});
async function replayOrder(order,email,session,paymentMethod,fingerprint){
  if(String(order.email).toLowerCase()!==email.toLowerCase())return fail('This checkout key is already associated with a different email.',409);
  if(order.paymentMethod!==paymentMethod||order.checkoutFingerprint!==fingerprint)return fail('This checkout key is associated with different order details or a different payment method. Refresh checkout to continue.',409);
  if(order.userId&&String(order.userId)!==String(session?.sub))return fail('This checkout key is already associated with a different account.',409);
  if(order.paymentStatus==='paid')return ok({id:String(order._id),orderNumber:order.orderNumber,total:order.total,currency:order.currency||'INR',paymentMethod:'paid',alreadyPaid:true,reused:true},200);
  if(order.paymentMethod==='cod')return ok({id:String(order._id),orderNumber:order.orderNumber,total:order.total,currency:order.currency||'INR',paymentMethod:'cod',expiresAt:null,reused:true},200);
  const active=await Reservation.findOne({orderId:order._id,status:'active',expiresAt:{$gt:new Date()}}).sort({expiresAt:1}).lean();
  if(!active)return fail('The checkout reservation has expired. Return to your bag and create a new quote.',409);
  return ok({id:String(order._id),orderNumber:order.orderNumber,total:order.total,currency:order.currency||'INR',paymentMethod:order.paymentMethod,expiresAt:active.expiresAt,reused:true},200);
}
export async function POST(request){
  const ip=(request.headers.get('x-forwarded-for')||'unknown').split(',')[0].trim();if(!rateLimit(`reserve:${ip}`,{limit:12,windowMs:60*60000}).allowed)return fail('Too many checkout attempts. Try again later.',429);
  const parsed=reservationSchema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Please complete the delivery details.',400,parsed.error.flatten());
  const checkoutKey=parsed.data.idempotencyKey||randomBytes(16).toString('hex');let dbSession,checkoutFingerprint='';
  try{
    if(!process.env.MONGODB_URI)return fail('Database connection unavailable. Please try again later.',503);
    await connectDB();await releaseExpiredReservations();const account=await getSession();
    const items=await resolveCheckoutItems(parsed.data.items),subtotal=items.reduce((sum,item)=>sum+item.price*item.qty,0);
    let couponDiscount=0,couponCode=null;
    if(parsed.data.coupon){const coupon=await getCoupon(parsed.data.coupon),now=new Date();if(!coupon||!coupon.active||coupon.startsAt&&new Date(coupon.startsAt)>now||coupon.endsAt&&new Date(coupon.endsAt)<=now||subtotal<Number(coupon.minCartValue||0))return fail('This coupon is invalid or does not apply to this cart.',400);couponDiscount=coupon.kind==='percentage'?Math.round(subtotal*coupon.value/100):Number(coupon.value);if(coupon.maxDiscount)couponDiscount=Math.min(couponDiscount,Number(coupon.maxDiscount));couponCode=coupon.code;}
    const pincode=parsed.data.pincode||parsed.data.address.pincode,fees=estimateFees(items,pincode),quote=quoteCart(items.map((item)=>({sku:item.sku,name:item.name,price:item.price,qty:item.qty})),{...fees,couponDiscount});
    const codAllowed=checkServiceability(pincode).serviceable&&quote.total<=25000;if(parsed.data.paymentMethod==='cod'&&!codAllowed)return fail('Cash on delivery is not available for this pincode or order value.',409);
    const addressFingerprint=Object.fromEntries(Object.entries(parsed.data.address).map(([key,value])=>[key,typeof value==='string'?value.trim().toLowerCase():value]));checkoutFingerprint=createHash('sha256').update(JSON.stringify({items:parsed.data.items.map(({sku,qty})=>({sku,qty})).sort((a,b)=>a.sku.localeCompare(b.sku)),email:parsed.data.email.toLowerCase(),phone:parsed.data.phone,address:addressFingerprint,pincode,couponCode,paymentMethod:parsed.data.paymentMethod,total:quote.total})).digest('hex');
    const existing=await Order.findOne({checkoutKey}).lean();if(existing)return replayOrder(existing,parsed.data.email,account,parsed.data.paymentMethod,checkoutFingerprint);
    dbSession=await mongoose.startSession();let created;
    await dbSession.withTransaction(async()=>{
      const snapshots=quote.lines.map((line,index)=>{const item=items[index];return {productId:item.productId||item._id,variantId:item.variantId||undefined,name:item.name,slug:item.slug,image:item.image,variant:item.variant,sku:item.sku,qty:line.qty,unitPrice:line.unitPrice,tax:line.tax,discount:couponDiscount?Math.round(couponDiscount*line.unitPrice*line.qty/Math.max(1,subtotal)):0,lineTotal:line.lineTotal,warrantySnapshot:item.warranty}});
      if(couponCode){const now=new Date(),coupon=await Coupon.findOne({code:couponCode,active:true}).session(dbSession);if(!coupon||coupon.startsAt&&coupon.startsAt>now||coupon.endsAt&&coupon.endsAt<=now||subtotal<Number(coupon.minCartValue||0))throw new Error('Coupon terms changed during checkout. Please review your bag.');let verifiedDiscount=coupon.kind==='percentage'?Math.round(subtotal*coupon.value/100):Number(coupon.value);if(coupon.maxDiscount)verifiedDiscount=Math.min(verifiedDiscount,coupon.maxDiscount);if(verifiedDiscount!==couponDiscount)throw new Error('Coupon discount changed during checkout. Please review your bag.');const useQuery={_id:coupon._id,active:true};if(coupon.usageLimit!=null)useQuery.usageCount={$lt:coupon.usageLimit};if(coupon.startsAt)useQuery.startsAt={$lte:now};if(coupon.endsAt)useQuery.endsAt={$gt:now};const used=await Coupon.updateOne(useQuery,{$inc:{usageCount:1}},{session:dbSession});if(!used.matchedCount)throw new Error('This coupon has reached its usage limit.');}
      const initialStatus=parsed.data.paymentMethod==='cod'?'confirmed':'reserved';
      const [order]=await Order.create([{
        orderNumber:`RF${Date.now()}${randomBytes(2).toString('hex').toUpperCase()}`,
        checkoutKey,
        checkoutFingerprint,
        userId:account?.sub,
        email:parsed.data.email.toLowerCase(),
        phone:parsed.data.phone,
        paymentMethod:parsed.data.paymentMethod,
        status:initialStatus,
        paymentStatus:parsed.data.paymentMethod==='cod'?'unpaid':'pending',
        items:snapshots,
        shippingAddress:parsed.data.address,
        billingAddress:parsed.data.address,
        buyerGstin:parsed.data.buyerGstin,
        buyerBusinessName:parsed.data.buyerBusinessName,
        isB2B:Boolean(parsed.data.buyerGstin && parsed.data.isB2B),
        subtotal:quote.subtotal,
        tax:quote.tax,
        deliveryFee:quote.deliveryFee,
        installationFee:quote.installationFee,
        discount:couponDiscount,
        total:quote.total,
        couponCode,
        notes:parsed.data.notes,
        timeline:[{status:initialStatus,at:new Date(),note:parsed.data.paymentMethod==='cod'?'Cash on delivery accepted under sample pincode and order-value rules.':'Stock temporarily reserved for checkout.'}]
      }],{session:dbSession});
      for(const item of items){
        const variant=await Variant.findOne({sku:item.sku,active:true}).session(dbSession);if(!variant)throw new Error(`SKU ${item.sku} is no longer available.`);
        const warehouseStocks=await Inventory.find({variantId:variant._id,available:{$gt:0}}).sort({available:-1}).session(dbSession).lean();let remaining=item.qty;
        for(const candidate of warehouseStocks){
          if(remaining<=0)break;const take=Math.min(remaining,candidate.available),stock=await Inventory.findOneAndUpdate({_id:candidate._id,available:{$gte:take}},{$inc:{available:-take,reserved:take}},{new:true,session:dbSession});
          if(!stock)throw new Error(`${item.name} stock changed during checkout; please try again.`);
          const expiresAt=new Date(Date.now()+20*60000),reservationStatus=parsed.data.paymentMethod==='cod'?'consumed':'active';
          await Reservation.create([{orderId:order._id,variantId:variant._id,warehouseId:stock.warehouseId,qty:take,status:reservationStatus,expiresAt,purgeAt:reservationStatus==='consumed'?new Date(Date.now()+7*86400000):undefined}],{session:dbSession});
          if(parsed.data.paymentMethod==='cod'){const consumed=await Inventory.updateOne({_id:stock._id,reserved:{$gte:take}},{$inc:{reserved:-take}},{session:dbSession});if(!consumed.matchedCount)throw new Error('Inventory reservation could not be consumed.');}
          await StockMovement.create([{variantId:variant._id,warehouseId:stock.warehouseId,orderId:order._id,kind:parsed.data.paymentMethod==='cod'?'sale':'reserve',quantity:-take,reference:`checkout:${order.orderNumber}:${stock.warehouseId}`}],{session:dbSession});remaining-=take;
        }
        if(remaining>0)throw new Error(`${item.name} is no longer available in the requested quantity.`);
        if(variant.productId){
          await Product.updateOne({_id:variant.productId},{$inc:{stock:-item.qty}},{session:dbSession});
        }
      }
      created={id:String(order._id),orderNumber:order.orderNumber,total:order.total,currency:'INR',paymentMethod:parsed.data.paymentMethod,expiresAt:parsed.data.paymentMethod==='cod'?null:new Date(Date.now()+20*60000).toISOString(),demoOnly:false,reused:false};
    });
    return ok(created,201);
  }catch(error){
    if(error.code===11000){try{await connectDB();const existing=await Order.findOne({checkoutKey}).lean();if(existing)return await replayOrder(existing,parsed.data.email,await getSession(),parsed.data.paymentMethod,checkoutFingerprint)}catch{}}
    if(error.message.includes('replica set')||error.message.includes('Transaction numbers'))return fail('Database transaction unavailable. Please try again later.',503);
    return fail(error.message,400);
  }finally{await dbSession?.endSession()}
}
