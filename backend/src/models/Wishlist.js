import mongoose from 'mongoose';
export default mongoose.model('Wishlist', new mongoose.Schema({ user:String, products:[String] },{timestamps:true}));
