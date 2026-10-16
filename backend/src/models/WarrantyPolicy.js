import mongoose from 'mongoose';
const WarrantyPolicySchema=new mongoose.Schema({ brand:String, category:String, manufacturerDays:Number, sellerDays:Number, extendedDays:Number, activationTrigger:{type:String,enum:['delivery_date','installation_signoff']}, version:Number },{timestamps:true});
export default mongoose.model('WarrantyPolicy',WarrantyPolicySchema);
