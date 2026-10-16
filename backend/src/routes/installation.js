import { Router } from 'express';
const r=Router();
r.get('/installation/slots', (req,res)=> res.json({ slots:['Tomorrow 10AM','Tomorrow 2PM'] }));
r.post('/installations', (req,res)=> res.json({ok:true}));
r.patch('/installations/:id/reschedule', (req,res)=> res.json({ok:true}));
export default r;
