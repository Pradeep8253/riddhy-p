import mongoose from 'mongoose';
const InstallationSchema=new mongoose.Schema({ order:{type:mongoose.Schema.Types.ObjectId,ref:'Order'}, slot:Date, technician:{type:mongoose.Schema.Types.ObjectId,ref:'User'}, status:{type:String,enum:['pending','scheduled','completed','rescheduled','cancelled']}, proof:String },{timestamps:true});
export default mongoose.model('Installation',InstallationSchema);
