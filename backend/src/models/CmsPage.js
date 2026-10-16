import mongoose from 'mongoose';
export default mongoose.model('CmsPage', new mongoose.Schema({ slug:String, title:String, content:String },{timestamps:true}));
