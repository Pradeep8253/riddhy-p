import mongoose from 'mongoose';
export default mongoose.model('CartItem', new mongoose.Schema({ cart:String, sku:String, qty:Number },{timestamps:true}));
