import WishlistClient from '@/components/commerce/WishlistClient';
export const metadata={title:'Wishlist',robots:{index:false,follow:false}};
export default function WishlistPage(){return <section className="container" style={{paddingBlock:'50px 100px'}}><span className="kicker">Saved for later</span><h1 className="display-title">Your wishlist.</h1><p className="muted" style={{margin:'12px 0 28px'}}>Keep the pieces that feel right. Your wishlist stays on this device until you sign in.</p><WishlistClient/></section>}
