import mongoose from 'mongoose';
export default mongoose.model('ShipmentItem', new mongoose.Schema({ shipment:String, sku:String, qty:Number },{timestamps:true}));
