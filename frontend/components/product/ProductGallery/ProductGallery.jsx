'use client';
import { useState } from 'react';
import './ProductGallery.css';
export default function ProductGallery({ images=[] }){
  const [idx,setIdx]=useState(0);
  const [zoom,setZoom]=useState(false);
  return (
    <div className="gallery">
      <div className="gallery__main" onMouseEnter={()=>setZoom(true)} onMouseLeave={()=>setZoom(false)} onClick={()=>setZoom(!zoom)}>
        <img src={images[idx]} alt="Product" className={`gallery__img ${zoom?'gallery__img--zoom':''}`}/>
        <span className="gallery__hint">{zoom?'Click to reset':'Hover to zoom'}</span>
      </div>
      <div className="gallery__thumbs">
        {images.map((img,i)=> <button key={i} onClick={()=>setIdx(i)} className={`gallery__thumb ${idx===i?'gallery__thumb--active':''}`}><img src={img} alt=""/></button>)}
      </div>
    </div>
  );
}
