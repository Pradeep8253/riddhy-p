import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { Product, Variant, Category, Brand, Warehouse, Inventory, StockMovement, AuditLog } from '@/models/index';
import { requireAdmin } from '@/lib/roles';
import { ok, fail, jsonBody } from '@/lib/http';
import { revalidateTag } from 'next/cache';
const productSchema=z.object({name:z.string().min(3).max(160),slug:z.string().regex(/^[a-z0-9-]+$/),sku:z.string().trim().regex(/^[A-Z0-9-]{3,40}$/),type:z.enum(['furniture','appliance']),modelType:z.string().max(40).optional(),category:z.string().min(2),brand:z.string().min(2),price:z.number().positive(),mrp:z.number().positive(),stock:z.number().int().min(0).max(100000).default(0),image:z.string().startsWith('/').optional(),description:z.string().max(4000).optional(),status:z.enum(['draft','active','archived']).default('draft'),specs:z.record(z.string(),z.unknown()).optional(),dimensions:z.record(z.string(),z.unknown()).optional()}).refine((data)=>data.mrp>=data.price,{message:'MRP must be greater than or equal to the selling price.',path:['mrp']});
export async function GET(request){
  const actor=await requireAdmin(new Set(['admin','super-admin','marketing','warehouse']));if(!actor)return fail('Admin permission required.',403);
  try{
    await connectDB();const url=new URL(request.url),page=Math.max(1,Number(url.searchParams.get('page')||1)),limit=Math.min(100,Math.max(1,Number(url.searchParams.get('limit')||50))),filter=url.searchParams.get('status')?{status:url.searchParams.get('status')}:{};
    const [items,total]=await Promise.all([Product.find(filter).sort({updatedAt:-1}).skip((page-1)*limit).limit(limit).lean(),Product.countDocuments(filter)]);
    const ids=items.map((item)=>item._id),variants=await Variant.find({productId:{$in:ids}}).sort({createdAt:1}).lean(),variantByProduct=new Map();for(const variant of variants)if(!variantByProduct.has(String(variant.productId)))variantByProduct.set(String(variant.productId),variant);
    const variantIds=variants.map((variant)=>variant._id),stocks=await Inventory.aggregate([{$match:{variantId:{$in:variantIds}}},{$group:{_id:'$variantId',available:{$sum:'$available'},reserved:{$sum:'$reserved'}}}]),stockByVariant=new Map(stocks.map((stock)=>[String(stock._id),stock]));
    const result=items.map((item)=>{const variant=variantByProduct.get(String(item._id)),stock=variant?stockByVariant.get(String(variant._id)):null;return {...item,id:String(item._id),_id:undefined,sku:variant?.sku||'',price:variant?.price??item.price,mrp:variant?.mrp??item.mrp,stock:stock?.available??variant?.stock??0,reserved:stock?.reserved??0}});
    return ok(result,200,{page,limit,total});
  }catch(error){return fail(error.message,500)}
}
export async function POST(request){
  const actor=await requireAdmin(new Set(['admin','super-admin','marketing']));if(!actor)return fail('Admin permission required.',403);
  const parsed=productSchema.safeParse(await jsonBody(request));if(!parsed.success)return fail('Product details are invalid.',400,parsed.error.flatten());
  let session;
  try{
    await connectDB();const data=parsed.data;session=await mongoose.startSession();let saved;
    await session.withTransaction(async()=>{
      const category=await Category.findOne({slug:data.category,active:true}).session(session);if(!category)throw new Error('Choose a valid active category.');if(category.type!==data.type)throw new Error('Category type must match product type.');
      const productBefore=await Product.findOne({slug:data.slug}).session(session);const existingVariant=productBefore?await Variant.findOne({productId:productBefore._id}).sort({createdAt:1}).session(session):null;if(existingVariant&&existingVariant.sku!==data.sku)throw new Error('SKU changes are not supported by this single-variant editor. Create a separate product variant instead.');
      const skuConflict=await Variant.findOne({sku:data.sku}).session(session);if(skuConflict&&(!productBefore||String(skuConflict.productId)!==String(productBefore._id)))throw new Error('That SKU is already assigned to a different product.');
      const brand=await Brand.findOne({name:data.brand}).session(session);
      const product=await Product.findOneAndUpdate({slug:data.slug},{$set:{...data,modelType:data.modelType||(data.type==='appliance'?'refrigerator':'sofa'),categoryId:category._id,brandId:brand?._id,categoryLabel:category.name,isDemo:false,isDemoImage:!data.image||data.image.startsWith('/images/'),media:data.image?[{url:data.image,kind:'image',alt:`${data.name} product image`,isDemoImage:data.image.startsWith('/images/') }]:[]}},{upsert:true,new:true,setDefaultsOnInsert:true,session});
      let variant;
      if(existingVariant){existingVariant.sku=data.sku;existingVariant.productId=product._id;existingVariant.price=data.price;existingVariant.mrp=data.mrp;existingVariant.stock=data.stock;existingVariant.active=data.status==='active';existingVariant.model3d={type:product.modelType||'furniture',dims:data.dimensions||{}};await existingVariant.save({session});variant=existingVariant;}
      else variant=await Variant.findOneAndUpdate({sku:data.sku},{$set:{productId:product._id,sku:data.sku,attributes:{finish:'Standard'},price:data.price,mrp:data.mrp,stock:data.stock,active:data.status==='active',model3d:{type:product.modelType||'furniture',dims:data.dimensions||{}}}},{upsert:true,new:true,setDefaultsOnInsert:true,session});
      const warehouseCode=process.env.DEFAULT_WAREHOUSE_CODE||'DELHI-01';const warehouse=await Warehouse.findOneAndUpdate({code:warehouseCode},{$setOnInsert:{code:warehouseCode,name:'Default fulfilment hub',active:true}},{upsert:true,new:true,setDefaultsOnInsert:true,session});
      const oldInventory=await Inventory.findOne({variantId:variant._id,warehouseId:warehouse._id}).session(session);const oldAvailable=oldInventory?.available||0;
      await Inventory.findOneAndUpdate({variantId:variant._id,warehouseId:warehouse._id},{$set:{available:data.stock,lowStockAt:4},$setOnInsert:{variantId:variant._id,warehouseId:warehouse._id,reserved:0}},{upsert:true,new:true,setDefaultsOnInsert:true,session});
      if(!oldInventory&&data.stock>0)await StockMovement.create([{variantId:variant._id,warehouseId:warehouse._id,kind:'opening',quantity:data.stock,reference:`admin-opening:${product.slug}`,actorId:actor.sub}],{session});
      else if(oldInventory&&oldAvailable!==data.stock)await StockMovement.create([{variantId:variant._id,warehouseId:warehouse._id,kind:'adjustment',quantity:data.stock-oldAvailable,reference:`admin-adjustment:${product.slug}:${Date.now()}`,actorId:actor.sub}],{session});
      await AuditLog.create([{actorId:actor.sub,actorEmail:actor.email,action:'product.upsert',entity:'Product',entityId:String(product._id),after:{name:product.name,status:product.status,sku:data.sku,stock:data.stock}}],{session});
      saved={id:String(product._id),slug:product.slug,sku:data.sku};
    });
    revalidateTag('catalogue','max');return ok(saved,201);
  }catch(error){if(error.code===11000)return fail('That product slug or SKU already exists.',409);return fail(error.message,400)}finally{await session?.endSession()}
}
