import mongoose from 'mongoose';
const CategorySchema=new mongoose.Schema({ name:String, slug:{type:String,unique:true}, parent:{type:mongoose.Schema.Types.ObjectId,ref:'Category'}, level:Number, image:String, isActive:{type:Boolean,default:true}, seo:{title:String,description:String}},{timestamps:true});
export default mongoose.model('Category',CategorySchema);
