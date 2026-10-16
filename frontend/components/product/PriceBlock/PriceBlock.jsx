import { formatCurrency, discountPercent } from '@/lib/formatCurrency';
import './PriceBlock.css';
export default function PriceBlock({ price, mrp }){
  const pct=discountPercent(mrp,price);
  return (
    <div className="priceblock">
      <div className="priceblock__row"><span className="priceblock__price">{formatCurrency(price)}</span>{pct>0 && <span className="priceblock__off">{pct}% off</span>}</div>
      {mrp>price && <div className="priceblock__mrp">MRP {formatCurrency(mrp)} <span>incl. taxes</span></div>}
      <div className="priceblock__emi">or No-Cost EMI from {formatCurrency(Math.round(price/12))}/mo • <a href="#">View plans</a></div>
    </div>
  );
}
