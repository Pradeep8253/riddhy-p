import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';
export default function ProductGrid({ products = [], compact = false, className = '' }) {
  return <div className={`${styles.grid} ${className}`}>{products.map((product)=><ProductCard key={product.slug} product={product} compact={compact}/>)}</div>;
}
