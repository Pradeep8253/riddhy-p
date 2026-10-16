import mongoose from 'mongoose';
const SpecsSchema=new mongoose.Schema({ material:String, dimensions:String, seating:String, warranty:String, capacity:String, energy:String, inverter:String, tonnage:String, star:String, size:String, resolution:String, os:String, coverage:String, type:String },{ _id:false, strict:false });
const ProductSchema=new mongoose.Schema({
  title:String, slug:{type:String,unique:true}, brand:{type:mongoose.Schema.Types.ObjectId,ref:'Brand'}, category:{type:mongoose.Schema.Types.ObjectId,ref:'Category'},
  rating:{type:Number,default:4.5}, reviews:{type:Number,default:0},
  images:[String], specs:SpecsSchema, features:[String], warrantyDays:Number, isActive:{type:Boolean,default:true},
  seo:{title:String,description:String}
},{timestamps:true});
export default mongoose.model('Product',ProductSchema);
