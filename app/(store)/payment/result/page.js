import PaymentResultClient from '@/components/commerce/PaymentResultClient';
export const metadata={title:'Payment status',robots:{index:false,follow:false}};
export default async function PaymentResultPage({searchParams}){const params=await searchParams;return <main className="container" style={{paddingBlock:'24px'}}><PaymentResultClient orderId={String(params?.orderId||'')} email={String(params?.email||'')} hint={String(params?.status||'pending')}/></main>}
