import ListingClient from './ListingClient';
import styles from './CatalogShell.module.css';
export default function CatalogShell({products,title,description}){return <section className={styles.shell}><div className="container"><ListingClient products={products} title={title} description={description}/></div></section>}
