import mongoose from 'mongoose';
const OrderItemSchema=new mongoose.Schema({ productSnapshot:{ title:String, brand:String, category:String, image:String, sku:String, variantLabel:String }, qty:Number, unitPrice:Number, mrp:Number, tax:Number, discount:Number, lineTotal:Number },{ _id:false });
const OrderSchema=new mongoose.Schema({
  orderNo:{type:String,unique:true}, user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
  items:[OrderItemSchema], address:{ name:String, phone:String, pincode:String, address:String, city:String, state:String },
  pricing:{ subtotal:Number, discount:Number, couponDiscount:Number, delivery:Number, total:Number, couponCode:String },
  status:{type:String,enum:['Draft Cart','Inventory Reserved','Payment Pending','Paid/Confirmed','Processing','Quality Check','Ready to Dispatch','Shipped','Out for Delivery','Delivered','Installation Pending','Installed/Completed','Payment Failed','Reservation Expired','Cancelled','Return Requested','Returned','Refund Pending','Refunded'],default:'Payment Pending'},
  payment:{ method:String, razorpayOrderId:String, razorpayPaymentId:String, razorpaySignature:String, status:String },
  deliverySlot:String, timeline:[{ status:String, at:Date, note:String }]
},{timestamps:true});
export default mongoose.model('Order',OrderSchema);
