import mongoose from 'mongoose';
export default mongoose.model('Role', new mongoose.Schema({ name:String, permissions:[String] },{timestamps:true}));
