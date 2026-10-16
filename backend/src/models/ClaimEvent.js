import mongoose from 'mongoose';
export default mongoose.model('ClaimEvent', new mongoose.Schema({ claim:String, status:String, note:String },{timestamps:true}));
