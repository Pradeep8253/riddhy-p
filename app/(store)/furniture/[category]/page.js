import { notFound } from 'next/navigation';
import ListingHeader from '@/components/store/ListingHeader';
import CatalogShell from '@/components/store/CatalogShell';
import { getProducts,getCategories } from '@/lib/catalogue';
export async function generateMetadata({params}){const {category}=await params;const found=(await getCategories('furniture')).find((item)=>item.slug===category);return {title:found?.name||'Furniture',description:found?`Browse ${found.name.toLowerCase()} with dimensions, material and service details at RF Riddhy.`:'Furniture from RF Riddhy'};}
export default async function FurnitureCategoryPage({params}){const {category}=await params;const found=(await getCategories('furniture')).find((item)=>item.slug===category);if(!found)notFound();const {items,total}=await getProducts({type:'furniture',category,limit:48});return <><ListingHeader eyebrow="Furniture · room-first living" title={found.name} description={`A carefully selected range of ${found.name.toLowerCase()}, with dimensions and care details up front.`} count={total}/><CatalogShell products={items} title={found.name} description="Use the filters to find your fit."/></>}
