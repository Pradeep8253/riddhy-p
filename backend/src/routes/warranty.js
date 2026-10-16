import { Router } from 'express';
import { listWarranties, register, createClaim } from '../controllers/warrantyController.js';
import { auth } from '../middlewares/auth.js';
const r=Router();
r.get('/me/warranties', auth, listWarranties);
r.post('/warranty/register', auth, register);
r.post('/warranty/claims', auth, createClaim);
r.post('/warranty/claims/:id/attachments', auth, (req,res)=> res.json({ok:true}));
export default r;
