import { Router } from 'express';
import { getCart, addToCart, updateCartItem, checkoutQuote } from '../controllers/cartController.js';
const r=Router();
r.post('/cart', addToCart);
r.get('/cart', getCart);
r.patch('/cart/items/:id', updateCartItem);
r.post('/checkout/quote', checkoutQuote);
r.post('/checkout/reservations', (req,res)=> res.json({ ok:true }));
export default r;
