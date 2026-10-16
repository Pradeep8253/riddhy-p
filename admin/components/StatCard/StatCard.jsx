export default function StatCard({ label, value, sub }){
  return <div className="stat"><small style={{color:'#6B7268',textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:700}}>{label}</small><div style={{fontSize:24,fontWeight:800,color:'#174D35'}}>{value}</div><small>{sub}</small></div>
}
