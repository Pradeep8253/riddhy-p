import mongoose from 'mongoose';
const PaymentSchema=new mongoose.Schema({ order:{type:mongoose.Schema.Types.ObjectId,ref:'Order'}, razorpayOrderId:String, razorpayPaymentId:String, amount:Number, currency:String, method:String, status:String, idempotencyKey:String },{timestamps:true});
export default mongoose.model('Payment',PaymentSchema);
