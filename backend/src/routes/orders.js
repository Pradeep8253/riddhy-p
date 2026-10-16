import { Router } from 'express';
import { listOrders, getOrder, cancelOrder, invoice } from '../controllers/orderController.js';
import { auth } from '../middlewares/auth.js';
const r=Router();
r.get('/me/orders', auth, listOrders);
r.get('/me/orders/:id', auth, getOrder);
r.post('/orders/:id/cancel', auth, cancelOrder);
r.get('/orders/:id/invoice', auth, invoice);
export default r;
