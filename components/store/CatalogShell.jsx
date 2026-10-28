import { Suspense } from 'react';
import ListingClient from './ListingClient';
import styles from './CatalogShell.module.css';

export default function CatalogShell({ products, title, description }) {
  return (
    <section className={styles.shell}>
      <div className="container">
        <Suspense fallback={<div className={styles.loadingPlaceholder}>Loading catalog...</div>}>
          <ListingClient products={products} title={title} description={description} />
        </Suspense>
      </div>
    </section>
  );
}
