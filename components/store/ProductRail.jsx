'use client';

import { useRef } from 'react';
import ProductCard from '@/components/ui/ProductCard';
import Icon from '@/components/ui/Icon';
import styles from './ProductRail.module.css';
export default function ProductRail({ products=[] }){
 const track=useRef(null);
 const move=(direction)=>track.current?.scrollBy({left:direction*320,behavior:'smooth'});
 return <div className={styles.wrap}><div className={styles.controls}><button type="button" aria-label="Scroll products backward" onClick={()=>move(-1)}><Icon name="arrow" size={17} className={styles.back}/></button><button type="button" aria-label="Scroll products forward" onClick={()=>move(1)}><Icon name="arrow" size={17}/></button></div><div className={styles.track} ref={track}>{products.map((product)=><div key={product.slug} className={styles.item}><ProductCard product={product}/></div>)}</div></div>;
}
