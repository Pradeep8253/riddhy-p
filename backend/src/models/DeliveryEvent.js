import mongoose from 'mongoose';
const DeliveryEventSchema=new mongoose.Schema({ shipment:{type:mongoose.Schema.Types.ObjectId,ref:'Shipment'}, status:String, location:String, timestamp:Date },{timestamps:true});
export default mongoose.model('DeliveryEvent',DeliveryEventSchema);
