import SidebarNav from '@/components/account/SidebarNav/SidebarNav';
import './layout.css';
export default function AccountLayout({ children }){
  return <div className="account"><div className="account__sidebar"><SidebarNav/></div><div className="account__content">{children}</div></div>
}
