import mongoose from 'mongoose';
const ShipmentSchema=new mongoose.Schema({ order:{type:mongoose.Schema.Types.ObjectId,ref:'Order'}, shipmentNo:String, status:String, carrier:String, trackingNo:String, items:[{ sku:String, qty:Number }] },{timestamps:true});
export default mongoose.model('Shipment',ShipmentSchema);
