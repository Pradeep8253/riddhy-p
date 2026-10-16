import CartClient from '@/components/commerce/CartClient';
export const metadata={title:'Your bag',robots:{index:false,follow:false}};
export default function CartPage(){return <section className="container" style={{paddingBlock:'45px 95px'}}><span className="kicker">Your selection</span><h1 className="display-title">The bag.</h1><p className="muted" style={{margin:'12px 0 30px'}}>We’ll confirm the final price, pincode service and delivery charges at checkout.</p><CartClient/></section>}
