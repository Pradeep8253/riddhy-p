'use client';

import Link from 'next/link';
import { useDispatch,useSelector } from 'react-redux';
import { removeCompareItem,clearCompare } from '@/store/compareSlice';
import { addItem } from '@/store/cartSlice';
import { showToast } from '@/store/uiSlice';
import { formatINR } from '@/lib/demo-data';
import ProductGrid from '@/components/ui/ProductGrid';
import Button from '@/components/ui/Button';
import styles from './CompareClient.module.css';
const fields=[['Price','price'],['Category','categoryLabel'],['Brand','brand'],['Width','dimensions.width'],['Depth','dimensions.depth'],['Height','dimensions.height'],['Material','specs.material'],['Capacity','specs.capacity'],['Energy rating','specs.energyRating'],['Warranty','warranty.manufacturer'],['Seller cover','warranty.seller']];
function get(item,path){return path.split('.').reduce((value,key)=>value?.[key],item)}
export default function CompareClient(){const items=useSelector((state)=>state.compare.items);const dispatch=useDispatch();if(!items.length)return <div className={styles.empty}><h2>Your comparison is waiting.</h2><p>Add up to four items to compare dimensions, materials, capacity and warranty side by side.</p><Button href="/furniture">Explore the collection</Button></div>;const add=(item)=>{dispatch(addItem({...item,variantId:item.sku,qty:1}));dispatch(showToast({message:`${item.name} added to your bag`,kind:'success'}))};return <div className={styles.compare}><div className={styles.top}><span>{items.length} of 4 products</span><button type="button" onClick={()=>dispatch(clearCompare())}>Clear comparison</button></div><div className={styles.products}><ProductGrid products={items} compact/></div><div className={styles.tableWrap}><table className={styles.table}><tbody>{fields.map(([label,path])=>{const vals=items.map((item)=>get(item,path));const unique=new Set(vals.map((value)=>String(value??''))).size>1;return <tr key={label}><th>{label}</th>{items.map((item,index)=><td key={item.slug} className={unique?styles.diff:''}>{label==='Price'?formatINR(vals[index]):label==='Width'||label==='Depth'||label==='Height'?`${vals[index]??'—'} cm`:String(vals[index]??'—')}</td>)}</tr>})}<tr><th>Action</th>{items.map((item)=><td key={item.slug}><div className={styles.action}><button type="button" onClick={()=>add(item)}>Add to bag</button><button type="button" onClick={()=>dispatch(removeCompareItem(item.slug))}>Remove</button></div></td>)}</tr></tbody></table></div><p className={styles.note}>Product imagery and catalogue data are illustrative demo content. Always confirm exact product specifications before ordering.</p></div>}
