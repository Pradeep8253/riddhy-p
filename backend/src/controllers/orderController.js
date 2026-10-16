export async function listOrders(req,res){ res.json({ data:[] }); }
export async function getOrder(req,res){ res.json({ data:{ id:req.params.id, status:'Delivered' } }); }
export async function cancelOrder(req,res){ res.json({ ok:true }); }
export async function invoice(req,res){ res.json({ url:'/invoices/RF-INV-xxx.pdf' }); }
