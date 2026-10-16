import { Router } from 'express';
const r=Router();
r.get('/storefront/campaigns', (req,res)=> res.json({data:[]}));
r.post('/admin/banners', (req,res)=> res.json({ok:true}));
r.post('/admin/promotions', (req,res)=> res.json({ok:true}));
r.post('/admin/coupons', (req,res)=> res.json({ok:true}));
export default r;
