import { formatCurrency } from '@/lib/formatCurrency';
import './CartSummary.css';
export default function CartSummary({ subtotal, mrpTotal, discount, delivery, couponDiscount, total, coupon }){
  return <div className="csummary">
    <h3>Price Details</h3>
    <div className="csummary__row"><span>MRP ({mrpTotal? '':''})</span><span>{formatCurrency(mrpTotal)}</span></div>
    <div className="csummary__row csummary__row--green"><span>Discount</span><span>-{formatCurrency(discount)}</span></div>
    {coupon && <div className="csummary__row csummary__row--green"><span>Coupon ({coupon.code})</span><span>-{formatCurrency(couponDiscount)}</span></div>}
    <div className="csummary__row"><span>Delivery</span><span>{delivery===0? <span className="free">FREE</span>: formatCurrency(delivery)}</span></div>
    <div className="csummary__total"><span>Total Amount</span><span>{formatCurrency(total)}</span></div>
    <div className="csummary__save">You will save {formatCurrency(discount+couponDiscount)} on this order</div>
  </div>
}
