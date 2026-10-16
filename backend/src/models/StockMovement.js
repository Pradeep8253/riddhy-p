import mongoose from 'mongoose';
const StockMovementSchema=new mongoose.Schema({ product:String, variant:String, warehouse:String, type:{type:String,enum:['in','out','reserve','release','damage','transfer']}, qty:Number, ref:String, createdBy:String },{timestamps:true});
export default mongoose.model('StockMovement',StockMovementSchema);
