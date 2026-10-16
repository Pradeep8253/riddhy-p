import mongoose from 'mongoose';
const WarehouseSchema=new mongoose.Schema({ name:String, code:{type:String,unique:true}, address:String, pincode:String, isActive:Boolean },{timestamps:true});
export default mongoose.model('Warehouse',WarehouseSchema);
