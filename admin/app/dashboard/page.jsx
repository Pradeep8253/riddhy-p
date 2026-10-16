import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import AdminHeader from '@/components/AdminHeader/AdminHeader';
import StatCard from '@/components/StatCard/StatCard';
import ChartCard from '@/components/ChartCard/ChartCard';
import DataTable from '@/components/DataTable/DataTable';
export default function Dashboard(){
  return <div className="admin"><AdminSidebar/><main className="admin__main">
    <AdminHeader title="Dashboard"/>
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:16}}>
      <StatCard label="Gross Revenue" value="₹18.2L" sub="Net ₹14.8L"/>
      <StatCard label="Orders" value="1,243" sub="23% COD"/>
      <StatCard label="Payment Failures" value="18" sub="1.4%"/>
      <StatCard label="Returns" value="22" sub="1.8%"/>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16,marginBottom:16}}>
      <ChartCard title="Sales (last 30 days)"/>
      <ChartCard title="Category Mix"/>
    </div>
    <DataTable cols={["Order","Customer","Amount","Status"]} rows={[{Order:"RF-88421",Customer:"Rahul S",Amount:"₹42,999",Status:"Delivered"},{Order:"RF-88422",Customer:"Priya M",Amount:"₹26,990",Status:"Shipped"}]}/>
  </main></div>
}
