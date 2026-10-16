'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { allProducts } from '@/data/products';
import ProductGallery from '@/components/product/ProductGallery/ProductGallery';
import VariantSelector from '@/components/product/VariantSelector/VariantSelector';
import PriceBlock from '@/components/product/PriceBlock/PriceBlock';
import DeliveryPincodeChecker from '@/components/product/DeliveryPincodeChecker/DeliveryPincodeChecker';
import WarrantyInfoCard from '@/components/product/WarrantyInfoCard/WarrantyInfoCard';
import SpecsTable from '@/components/product/SpecsTable/SpecsTable';
import DimensionDiagram from '@/components/product/DimensionDiagram/DimensionDiagram';
import ReviewsSection from '@/components/product/ReviewsSection/ReviewsSection';
import QnASection from '@/components/product/QnASection/QnASection';
import RelatedProducts from '@/components/product/RelatedProducts/RelatedProducts';
import CompleteTheRoom from '@/components/product/CompleteTheRoom/CompleteTheRoom';
import StickyBuyBar from '@/components/product/StickyBuyBar/StickyBuyBar';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import RatingStars from '@/components/common/RatingStars/RatingStars';
import Tabs from '@/components/common/Tabs/Tabs';
import Button from '@/components/common/Button/Button';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/common/Toast/ToastProvider';
import { useWishlist } from '@/context/WishlistContext';
import { useCompare } from '@/context/CompareContext';
import './page.css';
export default function PDP(){
  const { slug } = useParams();
  const router=useRouter();
  const product=allProducts.find(p=>p.slug===slug) || allProducts[0];
  const [variant,setVariant]=useState(product.variants?.[0] || null);
  const { add } = useCart();
  const { toast }=useToast();
  const { toggle, has }=useWishlist();
  const { add: addCompare }=useCompare();
  const handleAdd=()=>{ add(product, variant); toast('Added to cart'); };
  const handleBuy=()=>{ add(product, variant); router.push('/checkout'); };
  return <div className="pdp">
    <Breadcrumb items={[{label:'Home',href:'/'},{label:product.category,href:`/${product.category.includes('refrigerator')||product.category.includes('televisions')? 'appliances':'furniture'}`},{label:product.title}]}/>
    <div className="pdp__grid">
      <ProductGallery images={variant?.image? [variant.image, ...product.images.slice(1)]: product.images}/>
      <div className="pdp__info">
        <div className="pdp__brand">{product.brand} • {product.category}</div>
        <h1 className="pdp__title">{product.title}</h1>
        <RatingStars rating={product.rating} count={product.reviews}/>
        <PriceBlock price={variant?.price ?? product.price} mrp={variant?.mrp ?? product.mrp}/>
        <VariantSelector variants={product.variants} selected={variant} onSelect={setVariant}/>
        <div className="pdp__actions"><Button variant="primary" size="lg" onClick={handleAdd}>Add to Cart</Button><Button variant="secondary" size="lg" onClick={handleBuy}>Buy Now</Button><button onClick={()=>{toggle(product.slug); toast(has(product.slug)?'Removed from wishlist':'Added to wishlist')}} className={`pdp__wish ${has(product.slug)?'pdp__wish--active':''}`}>♡ Wishlist</button><button onClick={()=>{const r=addCompare(product); toast(r.ok?'Added to compare':r.msg)}} className="pdp__compare">⇔ Compare</button></div>
        <DeliveryPincodeChecker/>
        <WarrantyInfoCard warrantyDays={product.warrantyDays}/>
        <Tabs tabs={[
          {label:'Specifications', content:<SpecsTable specs={product.specs}/>},
          {label:'Dimensions', content:<DimensionDiagram specs={product.specs}/>},
          {label:'Warranty', content:<WarrantyInfoCard warrantyDays={product.warrantyDays}/>},
          {label:'Reviews', content:<ReviewsSection rating={product.rating} count={product.reviews}/>},
          {label:'Q&A', content:<QnASection/>},
        ]}/>
      </div>
    </div>
    <RelatedProducts category={product.category}/>
    <CompleteTheRoom/>
    <StickyBuyBar product={product} variant={variant} onAdd={handleAdd} onBuy={handleBuy}/>
  </div>
}
