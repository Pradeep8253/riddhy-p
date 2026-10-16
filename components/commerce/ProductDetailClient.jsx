'use client';

import Image from 'next/image';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { showToast } from '@/store/uiSlice';
import { formatINR } from '@/lib/demo-data';
import { IMG } from '@/lib/images';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import MaterialConfigurator from '@/components/three/MaterialConfigurator';
import ExplodeView from '@/components/three/ExplodeView';
import ServiceabilityChecker from '@/components/store/ServiceabilityChecker';
import ProductRail from '@/components/store/ProductRail';
import DimensionDiagram from './DimensionDiagram';
import styles from './ProductDetailClient.module.css';
const ProductModelCanvas=dynamic(()=>import('./ProductModelCanvas'),{ssr:false,loading:()=> <div className={styles.viewerLoading}>Preparing the 3D view…</div>});
const swatches=['#6b8f5e','#c4a47d','#e7e2d7','#28553a'];

export default function ProductDetailClient({product,related=[]}){
 const dispatch=useDispatch();const [activeMedia,setActiveMedia]=useState(0),[view,setView]=useState('photo'),[qty,setQty]=useState(1),[finish,setFinish]=useState(product.modelType==='sofa'?swatches[0]:'#dce0da'),[open,setOpen]=useState(false),[explode,setExplode]=useState(0),[rotation,setRotation]=useState([0,0,0]);
 const media=useMemo(()=>[{src:product.image||IMG.products.sofa,alt:product.imageAlt||`${product.name} illustrative product image`},{src:IMG.rooms.find((room)=>room.slug===product.room)?.src||IMG.rooms[0].src,alt:`${product.name} shown in a room illustration`},{src:IMG.categories[product.category]||product.image,alt:`${product.categoryLabel} illustrated collection`}],[product]);
 const add=()=>{dispatch(addItem({...product,variantId:product.sku,qty}));dispatch(showToast({message:`${qty} × ${product.name} added to your bag`,kind:'success'}))};
 const handleKeys=(event)=>{if(event.key==='ArrowLeft')setRotation(([x,y,z])=>[x,y-.12,z]);if(event.key==='ArrowRight')setRotation(([x,y,z])=>[x,y+.12,z]);if(event.key==='+')setRotation(([x,y,z])=>[x,y,z-.08]);if(event.key==='-')setRotation(([x,y,z])=>[x,y,z+.08]);if(event.key==='Enter'&&['refrigerator','washer','wardrobe','microwave'].includes(product.modelType))setOpen((v)=>!v)};
 const dims=product.dimensions||{};
 return <>
  <div className={styles.breadcrumb}><div className="container"><Link href="/">Home</Link><span>/</span><Link href={product.type==='furniture'?'/furniture':'/appliances'}>{product.type==='furniture'?'Furniture':'Appliances'}</Link><span>/</span><span>{product.name}</span></div></div>
  <section className={styles.product}><div className="container"><div className={styles.grid}>
    <div className={styles.gallery}><div className={styles.mainMedia} onKeyDown={handleKeys} tabIndex={0} aria-label="Product gallery and 3D viewer; arrow keys rotate model; plus and minus zoom; Enter opens moving parts.">
      {view==='photo'&&<Image src={media[activeMedia].src} alt={media[activeMedia].alt} fill priority sizes="(max-width:900px) 100vw, 52vw" placeholder="blur" blurDataURL={IMG.blurDataURL} unoptimized/>}
      {view==='dimensions'&&<div className={styles.diagram}><DimensionDiagram dimensions={dims}/><span>Illustrative dimension diagram · measurements on product listing are the reference</span></div>}
      {view==='3d'&&<ProductModelCanvas type={product.modelType} dims={dims} colorway={finish} open={open} explode={explode} rotation={rotation} showHotspots/>}
      {product.isDemoImage&&<span className={styles.demoPill}>Demo image</span>}
      <div className={styles.viewTabs} role="tablist" aria-label="Product media"><button type="button" role="tab" aria-selected={view==='photo'} onClick={()=>setView('photo')}>Photos</button><button type="button" role="tab" aria-selected={view==='dimensions'} onClick={()=>setView('dimensions')}>Dimensions</button><button type="button" role="tab" aria-selected={view==='3d'} onClick={()=>setView('3d')}>3D view</button></div>
    </div>
    {view==='photo'&&<div className={styles.thumbs}>{media.map((item,index)=><button type="button" className={activeMedia===index?styles.thumbActive:''} aria-label={`Show image ${index+1}: ${item.alt}`} key={item.src} onClick={()=>setActiveMedia(index)}><Image src={item.src} alt="" width={90} height={90} unoptimized/></button>)}</div>}
    {view==='3d'&&<div className={styles.modelTools}><MaterialConfigurator value={finish} onChange={setFinish}/>{['refrigerator','washer','wardrobe','microwave'].includes(product.modelType)&&<button className={styles.openToggle} type="button" onClick={()=>setOpen(!open)}>{open?'Close':'Open'} {product.categoryLabel.toLowerCase()}</button>}<ExplodeView value={explode} onChange={setExplode}/><small>Drag to rotate · arrow keys also work · demo procedural model</small></div>}</div>
    <div className={styles.info}>
      <div className={styles.brand}>{product.brand||'Riddhy Select'} <span>·</span> {product.categoryLabel}</div><h1>{product.name}</h1><p className={styles.tagline}>{product.tagline}</p>
      <div className={styles.rating}>{product.rating&&product.reviewCount?<span>★ {product.rating} · {product.reviewCount} reviews</span>:<span>No verified ratings yet</span>}<a href="#reviews">Read review policy</a>{product.isDemo&&<span className={styles.demo}>Demo catalogue</span>}</div>
      <div className={styles.price}><strong>{formatINR(product.price)}</strong>{product.mrp>product.price&&<><del>{formatINR(product.mrp)}</del><span>{product.discount}% off</span></>}<small>{product.isDemo?'Sample price · applicable taxes and charges are shown at checkout.':'Applicable taxes and charges are shown at checkout.'}</small></div>
      <div className={styles.dimensionFirst}><div><span className={styles.label}>DIMENSION FIRST</span><b>{dims.width} × {dims.depth} × {dims.height} cm</b><small>W × D × H · plan a doorway clearance before ordering</small></div><button type="button" onClick={()=>setView('dimensions')}>View diagram <Icon name="arrow" size={15}/></button></div>
      <div className={styles.variants}><b>Finish</b><div>{swatches.map((color)=> <button key={color} type="button" aria-label={`Choose finish ${color}`} aria-pressed={finish===color} style={{'--swatch':color}} onClick={()=>setFinish(color)}/>)}</div></div>
      <div className={styles.warranty}><Icon name="check" size={17}/><div><b>Warranty shown separately</b><span>{product.warranty?.manufacturer||product.warranty?.seller||'See product details for current coverage'}</span>{product.warranty?.compressor&&<span>{product.warranty.compressor}</span>}<Link href="/policies/warranty">Coverage and start date details →</Link></div></div>
      <div className={styles.purchase}><div className={styles.qty}><button type="button" aria-label="Decrease quantity" onClick={()=>setQty(Math.max(1,qty-1))}>−</button><span>{qty}</span><button type="button" aria-label="Increase quantity" onClick={()=>setQty(Math.min(99,qty+1))}>+</button></div><Button onClick={add} size="lg" disabled={!product.isDemo&&Number(product.stock||0)<=0}>{product.isDemo||product.stock>0?`Add to bag · ${formatINR(product.price*qty)}`:'Out of stock'}</Button></div>
      <p className={styles.stock}><span/>{product.isDemo?' Sample stock shown · final availability is confirmed when you check out.':product.stock>0?` ${product.stock} available · rechecked at checkout.`:' Currently out of stock.'}</p>
    </div>
  </div>
  <div className={styles.detailBlocks}>
    <section className={styles.specs}><span className="kicker">Product details</span><h2>Good to know, at a glance.</h2><div className={styles.specGrid}>{Object.entries(product.specs||{}).filter(([,value])=>value).map(([key,value])=><div key={key}><span>{key.replace(/([A-Z])/g,' $1')}</span><b>{String(value)}</b></div>)}</div><div className={styles.package}><b>Package dimensions</b><span>{product.packageDimensions?.width} × {product.packageDimensions?.depth} × {product.packageDimensions?.height} cm</span><small>Check lift, stairway and doorway clearances before delivery.</small></div></section>
    <section className={styles.service}><span className="kicker">Service options</span><h2>Check your pincode.</h2><p>Delivery dates, charges and installation eligibility are confirmed for this item and location.</p><ServiceabilityChecker/></section>
  </div>
  <section id="reviews" className={styles.reviews}><span className="kicker">Customer notes</span><h2>Verified reviews, when they’re real.</h2><p>This sample listing does not contain verified customer testimonials. The live review area is ready for moderated, purchase-verified feedback.</p></section>
  {related.length>0&&<section className={styles.related}><div className="container"><h2>Complete the look</h2><ProductRail products={related}/></div></section>}
  </div></section>
  <div className={styles.stickyBuy}><div><b>{product.name}</b><span>{formatINR(product.price)}</span></div><Button onClick={add} size="sm" disabled={!product.isDemo&&Number(product.stock||0)<=0}>{!product.isDemo&&Number(product.stock||0)<=0?'Out of stock':'Add to bag'}</Button></div>
 </>;
}
