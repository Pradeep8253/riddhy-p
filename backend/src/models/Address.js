import mongoose from 'mongoose';
export default mongoose.model('Address', new mongoose.Schema({ user:String, label:String, pincode:String, address:String },{timestamps:true}));
