'use client';
import './SortDropdown.css';
export default function SortDropdown({ value, onChange }){
  return <select className="sort" value={value} onChange={e=>onChange(e.target.value)}><option value="popularity">Popularity</option><option value="price_low">Price: Low to High</option><option value="price_high">Price: High to Low</option><option value="newest">Newest First</option><option value="rating">Customer Rating</option><option value="discount">Discount</option></select>
}
