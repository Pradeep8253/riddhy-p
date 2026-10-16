'use client';

import { useDispatch,useSelector } from 'react-redux';
import { removeWishlistItem } from '@/store/wishlistSlice';
import ProductGrid from '@/components/ui/ProductGrid';
import Button from '@/components/ui/Button';
import styles from './WishlistClient.module.css';
export default function WishlistClient(){const items=useSelector((state)=>state.wishlist.items);const dispatch=useDispatch();if(!items.length)return <div className={styles.empty}><div className={styles.heart}>♡</div><h2>Keep the pieces you love close.</h2><p>Save a product to your wishlist and return when you’re ready.</p><Button href="/furniture">Browse furniture</Button></div>;return <div><div className={styles.top}><span>{items.length} saved {items.length===1?'piece':'pieces'}</span><button type="button" onClick={()=>items.forEach((item)=>dispatch(removeWishlistItem(item.slug)))}>Clear wishlist</button></div><ProductGrid products={items}/></div>}
