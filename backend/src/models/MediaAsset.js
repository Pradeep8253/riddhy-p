import mongoose from 'mongoose';
export default mongoose.model('MediaAsset', new mongoose.Schema({ url:String, type:String },{timestamps:true}));
