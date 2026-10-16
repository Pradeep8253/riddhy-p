import ListingHeader from '@/components/store/ListingHeader';
import CatalogShell from '@/components/store/CatalogShell';
import { getProducts } from '@/lib/catalogue';
export async function generateMetadata({searchParams}){const params=await searchParams;const q=String(params?.q||'').slice(0,80);return {title:q?`Search: ${q}`:'Search',robots:{index:false,follow:true}};}
export default async function SearchPage({searchParams}){const params=await searchParams;const q=String(params?.q||'').slice(0,100);const {items,total}=await getProducts({q,limit:48});return <><ListingHeader eyebrow="Search the collection" title={q?`Results for “${q}”`:'Find your next favourite.'} description="Search by product, category, SKU or brand. Try a shorter phrase if you don’t see what you need." count={total}/><CatalogShell products={items} title="Search results" description={q?`Showing matches for ${q}.`:'Enter a search in the header to get started.'}/></>}
