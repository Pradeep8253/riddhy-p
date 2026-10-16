import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
export function auth(req,res,next){
  const header=req.headers.authorization;
  const token= header?.startsWith('Bearer ')? header.slice(7): req.cookies?.token;
  if(!token) return res.status(401).json({ error:'Unauthorized' });
  try{ req.user=jwt.verify(token, env.JWT_SECRET); next(); }catch{ return res.status(401).json({error:'Invalid token'}); }
}
export function optionalAuth(req,res,next){
  const header=req.headers.authorization;
  const token= header?.startsWith('Bearer ')? header.slice(7): null;
  if(token){ try{ req.user=jwt.verify(token, env.JWT_SECRET);}catch{} }
  next();
}
