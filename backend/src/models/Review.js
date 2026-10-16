import mongoose from 'mongoose';
const ReviewSchema=new mongoose.Schema({ product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'}, user:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, rating:Number, text:String, images:[String], verifiedPurchase:Boolean, moderation:{status:String,history:[{action:String,by:String,at:Date}] }},{timestamps:true});
export default mongoose.model('Review',ReviewSchema);
