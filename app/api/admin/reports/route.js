import { connectDB } from '@/lib/db';
import { Order,Payment,WarrantyClaim,Inventory,Variant } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok,fail } from '@/lib/http';
export async function GET(){
  const actor=await requireAdmin(new Set(['admin','super-admin','finance','marketing']));if(!actor)return fail('Admin permission required.',403);
  try{
    await connectDB();const since=new Date(Date.now()-30*86400000);
    const [sales,orders,pendingPayments,lowStockRows,claims,topOrders]=await Promise.all([
      Order.aggregate([{$match:{createdAt:{$gte:since},paymentStatus:'paid'}},{$group:{_id:null,revenue:{$sum:'$total'},count:{$sum:1}}}]),
      Order.countDocuments({createdAt:{$gte:since}}),
      Payment.countDocuments({status:{$in:['created','authorized']}}),
      Inventory.aggregate([{$match:{$expr:{$lte:['$available','$lowStockAt']}}},{$group:{_id:'$variantId'}}]),
      WarrantyClaim.countDocuments({status:{$in:['submitted','under_review']}}),
      Order.find({createdAt:{$gte:since}}).select('total createdAt status').sort({createdAt:1}).limit(120).lean()
    ]);
    const lowVariantIds=lowStockRows.map((row)=>row._id),lowProducts=lowVariantIds.length?await Variant.distinct('productId',{_id:{$in:lowVariantIds}}):[];
    return ok({periodDays:30,revenue:sales[0]?.revenue||0,paidOrders:sales[0]?.count||0,orders,pendingPayments,lowStockProducts:lowProducts.length,openWarrantyClaims:claims,orderTrend:topOrders.map((item)=>({date:item.createdAt,amount:item.total,status:item.status}))});
  }catch(error){return fail(error.message,500)}
}
