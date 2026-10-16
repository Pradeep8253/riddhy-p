'use client';
import { useWishlist } from '@/context/WishlistContext';
import { allProducts } from '@/data/products';
import ProductGrid from '@/components/product/ProductGrid/ProductGrid';
import './page.css';
export default function WishlistPage(){
  const { ids }=useWishlist();
  const products=allProducts.filter(p=> ids.includes(p.slug));
  return <div className="wish"><h2>My Wishlist — {products.length} items</h2>{products.length? <ProductGrid products={products}/>: <div className="wish__empty">No items yet. Tap ♥ on any product.</div>}</div>
}
