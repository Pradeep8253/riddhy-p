import CompareClient from '@/components/commerce/CompareClient';
export const metadata={title:'Compare products',robots:{index:false,follow:false}};
export default function ComparePage(){return <section className="container" style={{paddingBlock:'50px 90px'}}><span className="kicker">Side by side, clearly</span><h1 className="display-title">Compare products.</h1><p className="muted" style={{margin:'12px 0 27px'}}>Compare up to four pieces at a time. Differences are highlighted to make the details easier to scan.</p><CompareClient/></section>}
