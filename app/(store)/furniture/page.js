import ListingHeader from '@/components/store/ListingHeader';
import CatalogShell from '@/components/store/CatalogShell';
import { getProducts } from '@/lib/catalogue';
export const metadata={title:'Furniture',description:'Explore sofas, beds, wardrobes, dining and study furniture at RF Riddhy.'};
export default async function FurniturePage(){const {items,total}=await getProducts({type:'furniture',limit:48});return <><ListingHeader eyebrow="Riddhy living spaces" title="Furniture with room to live." description="Warm materials, useful proportions and pieces made to work with everyday life." count={total}/><CatalogShell products={items} title="Furniture collection" description="Explore a thoughtfully curated range."/></>}
