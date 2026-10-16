import mongoose from 'mongoose';
const PromoSchema=new mongoose.Schema({ title:String, type:{type:String,enum:['percentage','flat','bundle']}, value:Number, eligibility:{categories:[String],brands:[String],skus:[String],minOrderValue:Number}, schedule:{start:Date,end:Date,timezone:String}, isActive:Boolean },{timestamps:true});
export default mongoose.model('Promotion',PromoSchema);
