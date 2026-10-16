import mongoose from 'mongoose';
const AuditLogSchema=new mongoose.Schema({ admin:{type:mongoose.Schema.Types.ObjectId,ref:'AdminUser'}, action:String, entity:String, entityId:String, before:Object, after:Object, ip:String },{timestamps:true});
export default mongoose.model('AuditLog',AuditLogSchema);
