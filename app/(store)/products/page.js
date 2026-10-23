import ListingHeader from '@/components/store/ListingHeader';
import CatalogShell from '@/components/store/CatalogShell';
import { getProducts } from '@/lib/catalogue';

export const metadata = {
  title: 'All Products — Furniture & Home Appliances | RF Riddhy',
  description:
    'Explore handcrafted timber furniture and smart home appliances at RF Riddhy Prayagraj. Complete suites for living, bedroom, dining, kitchen, and climate comfort.',
};

export default async function ProductsPage() {
  const { items, total } = await getProducts({ limit: 96 });

  return (
    <>
      <ListingHeader
        eyebrow="Complete Home Catalog"
        title="Furniture & Appliances Crafted for Real Life."
        description="Explore solid teak wood craftsmanship, certified smart inverter technology, and complete room ensembles from our showroom in Mansurabad, Prayagraj."
        count={total}
      />
      <CatalogShell
        products={items}
        title="All Products"
        description="Filter by room, category, price, and brand."
      />
    </>
  );
}
