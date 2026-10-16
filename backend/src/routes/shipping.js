import { Router } from 'express';
const r=Router();
r.post('/serviceability/check', (req,res)=> res.json({ serviceable:true, eta:'3-5 days' }));
r.post('/shipments', (req,res)=> res.json({ok:true}));
r.get('/shipments/:id/tracking', (req,res)=> res.json({ tracking:[] }));
export default r;
