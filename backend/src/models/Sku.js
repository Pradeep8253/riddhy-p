import mongoose from 'mongoose';
const SkuSchema=new mongoose.Schema({ sku:String, product:String, variant:String, barcode:String },{timestamps:true});
export default mongoose.model('Sku',SkuSchema);
