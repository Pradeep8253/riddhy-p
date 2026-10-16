import mongoose from 'mongoose';
const ClaimSchema=new mongoose.Schema({ registration:{type:mongoose.Schema.Types.ObjectId,ref:'ProductRegistration'}, user:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, issue:String, attachments:[String], status:{type:String,enum:['open','in_review','assigned','resolved','rejected']}, technician:String },{timestamps:true});
export default mongoose.model('WarrantyClaim',ClaimSchema);
