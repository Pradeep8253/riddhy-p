import { sampleOrders } from '@/data/products';
import OrderCard from '@/components/account/OrderCard/OrderCard';
import './page.css';
export default function Orders(){ return <div className="orders"><h2>My Orders</h2><div className="orders__list">{sampleOrders.map(o=> <OrderCard key={o.id} order={o}/>)}</div></div>}
