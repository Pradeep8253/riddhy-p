import mongoose from 'mongoose';
export default mongoose.model('OrderItem', new mongoose.Schema({ order:String, sku:String, qty:Number },{timestamps:true}));
