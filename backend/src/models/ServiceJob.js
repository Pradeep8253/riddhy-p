import mongoose from 'mongoose';
export default mongoose.model('ServiceJob', new mongoose.Schema({ claim:String, technician:String, status:String },{timestamps:true}));
