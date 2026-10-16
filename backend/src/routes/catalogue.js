import { Router } from 'express';
import { listProducts, getProduct, search } from '../controllers/catalogueController.js';
const r=Router();
r.get('/products', listProducts);
r.get('/products/:slug', getProduct);
r.get('/search', search);
r.get('/categories', (req,res)=> res.json({data:[]}));
r.get('/products/compare', (req,res)=> res.json({data:[]}));
export default r;
