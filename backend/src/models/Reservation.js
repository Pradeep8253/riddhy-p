import mongoose from 'mongoose';
const ReservationSchema=new mongoose.Schema({ cart:{type:mongoose.Schema.Types.ObjectId,ref:'Cart'}, sku:String, qty:Number, expiresAt:{type:Date,index:{expires:0}}, status:{type:String,enum:['active','released','converted'],default:'active'}},{timestamps:true});
export default mongoose.model('Reservation',ReservationSchema);
