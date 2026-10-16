import mongoose from 'mongoose';
const RegSchema=new mongoose.Schema({ user:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, order:{type:mongoose.Schema.Types.ObjectId,ref:'Order'}, product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'}, serialNo:String, purchaseDate:Date, activationDate:Date, expiryDate:Date, policyVersion:Number, status:String },{timestamps:true});
export default mongoose.model('ProductRegistration',RegSchema);
