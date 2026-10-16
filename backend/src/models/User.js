import mongoose from 'mongoose';
const AddressSchema=new mongoose.Schema({ label:String, name:String, phone:String, pincode:String, address:String, city:String, state:String, isDefault:Boolean },{ _id:true });
const UserSchema=new mongoose.Schema({
  name:{type:String,required:true}, email:{type:String,unique:true,required:true}, phone:String,
  passwordHash:String, role:{type:String,enum:['customer','support','warehouse','marketing','finance','technician','super-admin'],default:'customer'},
  addresses:[AddressSchema], consent:{marketing:Boolean,termsAcceptedAt:Date},
  status:{type:String,enum:['active','blocked','deleted'],default:'active'}
},{timestamps:true});
export default mongoose.model('User',UserSchema);
