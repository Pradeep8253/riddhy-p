export async function getCart(req,res){ res.json({ data:{ items:[] } }); }
export async function addToCart(req,res){ res.json({ ok:true }); }
export async function updateCartItem(req,res){ res.json({ ok:true }); }
export async function checkoutQuote(req,res){
  const { calculatePricing }=await import('../services/pricingEngine.js');
  const pricing=calculatePricing(req.body.items||[], null);
  res.json({ data: pricing });
}
