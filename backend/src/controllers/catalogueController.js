import Product from '../models/Product.js';
export async function listProducts(req,res,next){
  try{
    const { page=1, limit=12, category, brand, minPrice, maxPrice, sort='popularity' }=req.query;
    const q={ isActive:true };
    if(category) q.category=category;
    if(brand) q.brand=brand;
    let query=Product.find(q);
    const products=await query.skip((page-1)*limit).limit(Number(limit));
    res.json({ data:products, page:Number(page), total: products.length });
  }catch(e){ next(e); }
}
export async function getProduct(req,res,next){
  try{
    const p=await Product.findOne({ slug:req.params.slug });
    if(!p) return res.status(404).json({error:'Not found'});
    res.json({ data:p });
  }catch(e){ next(e); }
}
export async function search(req,res,next){
  try{
    const q=req.query.q||'';
    const products=await Product.find({ title: new RegExp(q,'i') }).limit(20);
    res.json({ data:products });
  }catch(e){ next(e); }
}
