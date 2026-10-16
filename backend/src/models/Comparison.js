import mongoose from 'mongoose';
export default mongoose.model('Comparison', new mongoose.Schema({ user:String, products:[String] },{timestamps:true}));
