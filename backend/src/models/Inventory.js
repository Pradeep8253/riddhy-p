import mongoose from 'mongoose';
const InventorySchema=new mongoose.Schema({ product:{type:mongoose.Schema.Types.ObjectId,ref:'Product'}, variant:{type:mongoose.Schema.Types.ObjectId,ref:'ProductVariant'}, warehouse:{type:mongoose.Schema.Types.ObjectId,ref:'Warehouse'}, onHand:{type:Number,default:0}, reserved:{type:Number,default:0}, damaged:{type:Number,default:0}, safetyStock:Number, reorderThreshold:Number },{timestamps:true});
export default mongoose.model('Inventory',InventorySchema);
