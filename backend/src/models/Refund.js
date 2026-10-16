import mongoose from 'mongoose';
const RefundSchema=new mongoose.Schema({ order:{type:mongoose.Schema.Types.ObjectId,ref:'Order'}, amount:Number, reason:String, razorpayRefundId:String, status:String, audit:String },{timestamps:true});
export default mongoose.model('Refund',RefundSchema);
