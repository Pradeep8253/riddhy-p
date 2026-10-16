import Link from 'next/link';
export default function AdminSidebar(){
  const links=[['Dashboard','/dashboard'],['Catalogue','/catalogue'],['Pricing','/pricing-promotions'],['Inventory','/inventory'],['Orders','/orders'],['Delivery','/delivery-installation'],['Warranty','/warranty-service'],['CMS Banners','/cms-banners'],['Customers','/customers'],['Reviews','/reviews'],['Reports','/reports'],['Roles & Audit','/roles-audit']];
  return <aside className="admin__sidebar"><div style={{fontWeight:800,fontSize:18,marginBottom:18}}>RF Riddhy Admin</div>{links.map(([l,h])=> <Link key={h} href={h}>{l}</Link>)}<Link href="/login" style={{marginTop:20,background:'#D99A32',color:'#fff',textAlign:'center'}}>Logout</Link></aside>
}
