import AdminSidebar from '@/components/AdminSidebar/AdminSidebar';
import AdminHeader from '@/components/AdminHeader/AdminHeader';
import DataTable from '@/components/DataTable/DataTable';
import StatCard from '@/components/StatCard/StatCard';
export default function Page(){
  return <div className="admin"><AdminSidebar/><main className="admin__main"><AdminHeader title="warranty-service"/><div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:16}}><StatCard label="Revenue" value="₹12.4L" sub="+8% vs last week"/><StatCard label="Orders" value="342" sub="12 pending"/><StatCard label="Stock Alerts" value="18" sub="Reorder needed"/></div><DataTable cols={["ID","Name","Status"]} rows={[{ID:"1",Name:"Sample",Status:"Active"},{ID:"2",Name:"Demo",Status:"Pending"}]}/></main></div>
}
