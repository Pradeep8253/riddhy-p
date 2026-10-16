import mongoose from 'mongoose';
const CartItemSchema=new mongoose.Schema({ product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'}, variant:{type:mongoose.Schema.Types.ObjectId,ref:'ProductVariant'}, sku:String, qty:Number, unitPrice:Number });
const CartSchema=new mongoose.Schema({ user:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, sessionId:String, items:[CartItemSchema], coupon:String, expiresAt:Date },{timestamps:true});
export default mongoose.model('Cart',CartSchema);
