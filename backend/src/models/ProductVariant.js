import mongoose from 'mongoose';
const VariantSchema=new mongoose.Schema({ product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'}, sku:{type:String,unique:true}, label:String, color:String, price:Number, mrp:Number, stock:Number, image:String, isActive:Boolean },{timestamps:true});
export default mongoose.model('ProductVariant',VariantSchema);
