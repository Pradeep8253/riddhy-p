'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { formatCurrency, discountPercent } from '@/lib/formatCurrency';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import { useToast } from '@/components/common/Toast/ToastProvider';
import RatingStars from '@/components/common/RatingStars/RatingStars';
import './ProductCard.css';
export default function ProductCard({ product }){
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const { add: addCompare } = useCompare();
  const { toast } = useToast();
  const wished = has(product.slug);
  const pct = discountPercent(product.mrp, product.price);
  const handleAdd = (e)=>{
    e.preventDefault(); e.stopPropagation();
    add(product, product.variants?.[0]);
    toast(`${product.title.slice(0,28)}... added to cart`);
    // fly animation trigger
    const btn = e.currentTarget;
    btn.animate([{transform:'scale(1)'},{transform:'scale(0.92)'},{transform:'scale(1)'}],{duration:300});
  };
  return (
    <motion.div className="pcard" whileHover={{y:-6}} transition={{type:'spring', stiffness:300, damping:20}}>
      <Link href={`/product/${product.slug}`} className="pcard__link">
        <div className="pcard__imgWrap">
          <img src={product.images[0]} alt={product.title} className="pcard__img pcard__img--main" loading="lazy"/>
          {product.images[1] && <img src={product.images[1]} alt="" className="pcard__img pcard__img--hover" loading="lazy"/>}
          {pct>0 && <span className="pcard__badge">{pct}% OFF</span>}
          <button aria-label="Wishlist" onClick={(e)=>{e.preventDefault();e.stopPropagation();toggle(product.slug); toast(wished?'Removed from wishlist':'Added to wishlist');}} className={`pcard__wish ${wished?'pcard__wish--active':''}`}>♥</button>
          {product.variants?.some(v=>v.stock===0) && product.variants.every(v=>v.stock===0) && <span className="pcard__oos">Out of Stock</span>}
          <div className="pcard__quick"><button onClick={handleAdd} className="pcard__addBtn">Add to Cart</button><button onClick={(e)=>{e.preventDefault();e.stopPropagation(); const r=addCompare(product); toast(r.ok?'Added to compare':r.msg, r.ok?'success':'warning');}} className="pcard__compare">⇔ Compare</button></div>
        </div>
        <div className="pcard__body">
          <div className="pcard__brand">{product.brand}</div>
          <div className="pcard__title">{product.title}</div>
          <RatingStars rating={product.rating} count={product.reviews} size={12}/>
          <div className="pcard__priceRow"><span className="pcard__price">{formatCurrency(product.price)}</span>{product.mrp>product.price && <span className="pcard__mrp">{formatCurrency(product.mrp)}</span>}<span className="pcard__emi">EMI from ₹{(Math.round(product.price/12)).toLocaleString('en-IN')}/mo</span></div>
        </div>
      </Link>
    </motion.div>
  );
}
