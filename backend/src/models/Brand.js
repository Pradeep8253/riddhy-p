import mongoose from 'mongoose';
const BrandSchema=new mongoose.Schema({ name:{type:String,unique:true}, slug:String, logo:String, isActive:Boolean },{timestamps:true});
export default mongoose.model('Brand',BrandSchema);
