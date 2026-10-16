import mongoose from 'mongoose';
const PriceSchema=new mongoose.Schema({ product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'}, variant:{type:mongoose.Schema.Types.ObjectId,ref:'ProductVariant'}, mrp:Number, sellingPrice:Number, currency:{type:String,default:'INR'}, effectiveFrom:Date, effectiveTo:Date },{timestamps:true});
export default mongoose.model('Price',PriceSchema);
