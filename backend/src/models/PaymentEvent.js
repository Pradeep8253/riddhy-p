import mongoose from 'mongoose';
const PaymentEventSchema=new mongoose.Schema({ eventId:{type:String,unique:true}, type:String, payload:Object, processed:Boolean },{timestamps:true});
export default mongoose.model('PaymentEvent',PaymentEventSchema);
