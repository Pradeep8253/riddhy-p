import { notFound } from 'next/navigation';
import ListingHeader from '@/components/store/ListingHeader';
import CatalogShell from '@/components/store/CatalogShell';
import { getProducts,getCategories } from '@/lib/catalogue';
export async function generateMetadata({params}){const {category}=await params;const found=(await getCategories('appliances')).find((item)=>item.slug===category);return {title:found?.name||'Home appliances',description:found?`Explore ${found.name.toLowerCase()} with capacity, energy and service details at RF Riddhy.`:'Home appliances at RF Riddhy'};}
export default async function ApplianceCategoryPage({params}){const {category}=await params;const found=(await getCategories('appliances')).find((item)=>item.slug===category);if(!found)notFound();const {items,total}=await getProducts({type:'appliance',category,limit:48});return <><ListingHeader eyebrow="Appliances · precision studio" title={found.name} description={`Compare ${found.name.toLowerCase()} with dimensions, specifications and delivery options made clear.`} count={total}/><CatalogShell products={items} title={found.name} description="Choose with the details in view."/></>}
