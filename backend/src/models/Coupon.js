import mongoose from 'mongoose';
const CouponSchema=new mongoose.Schema({ code:{type:String,unique:true,uppercase:true}, discountType:{type:String,enum:['flat','percent']}, discountValue:Number, maxDiscount:Number, minOrderValue:Number, usageLimit:Number, usedCount:{type:Number,default:0}, validFrom:Date, validTo:Date, isActive:Boolean },{timestamps:true});
export default mongoose.model('Coupon',CouponSchema);
