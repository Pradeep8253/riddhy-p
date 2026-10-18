import ProductCard from './ProductCard';
import styles from './ProductGrid.module.css';

export default function ProductGrid({
  products = [],
  compact = false,
  cols = 3,
  className = ''
}) {
  const colClass =
    cols === 2 ? styles.cols2 : cols === 4 ? styles.cols4 : styles.cols3;

  return (
    <div className={`${styles.grid} ${colClass} ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.slug}
          product={product}
          compact={compact || cols === 4}
        />
      ))}
    </div>
  );
}
