import { Router } from 'express';
const r=Router();
r.get('/admin/reports/sales', (req,res)=> res.json({data:{sales:1230000}}));
r.get('/admin/reports/inventory', (req,res)=> res.json({data:[]}));
r.get('/admin/reports/warranty', (req,res)=> res.json({data:[]}));
export default r;
