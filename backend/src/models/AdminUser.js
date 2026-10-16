import mongoose from 'mongoose';
const AdminUserSchema=new mongoose.Schema({ name:String, email:{type:String,unique:true}, passwordHash:String, role:{type:String,enum:['super-admin','marketing','finance','warehouse','support','technician']}, mfaSecret:String, isActive:Boolean },{timestamps:true});
export default mongoose.model('AdminUser',AdminUserSchema);
