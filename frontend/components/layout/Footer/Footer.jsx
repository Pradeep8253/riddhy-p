import Link from 'next/link';
import './Footer.css';
export default function Footer(){
  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="footer__grid">
          <div className="footer__brand">
            <div className="footer__logo"><span className="footer__mark">RF</span><span><strong>RF Riddhy</strong><small>Furniture & Appliances</small></span></div>
            <p>India's warm, premium home destination. Furniture crafted for generations — appliances chosen for life. Kanpur • Lucknow • Delhi NCR • 120+ serviceable pincodes.</p>
            <div className="footer__social"><a href="#">◎</a><a href="#">ⓕ</a><a href="#">▶</a><a href="#">𝕏</a></div>
          </div>
          <div><h4>Shop</h4><Link href="/furniture">Furniture</Link><Link href="/appliances">Appliances</Link><Link href="/search?q=bestseller">Best Sellers</Link><Link href="/search?q=new">New Arrivals</Link></div>
          <div><h4>Support</h4><Link href="/help/faq">FAQ</Link><Link href="/help/shipping-policy">Shipping Policy</Link><Link href="/help/returns-policy">Returns & Refunds</Link><Link href="/help/warranty-terms">Warranty Terms</Link><Link href="/help/contact">Contact Us</Link></div>
          <div><h4>Assurance</h4><span>✓ GST Invoices</span><span>✓ Secure Razorpay Payments</span><span>✓ Installation & Demo</span><span>✓ Easy EMI & COD</span><div className="footer__pay"><span className="footer__payBadge">UPI</span><span className="footer__payBadge">Cards</span><span className="footer__payBadge">NetBanking</span><span className="footer__payBadge">EMI</span><span className="footer__payBadge">COD</span></div></div>
        </div>
      </div>
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} RF Riddhy Pvt. Ltd. • CIN: U12345UP2024PTC000001 • GST: 09AABCR1234F1Z5</span>
        <span>Privacy • Terms • Grievance Officer: grievance@rfriddhy.com • 1800-123-7799</span>
      </div>
    </footer>
  );
}
