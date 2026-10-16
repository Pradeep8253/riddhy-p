import './page.css';
const addrs=[{name:'Rahul Sharma',phone:'98765 43210',address:'12/4 Civil Lines, Near Company Bagh',city:'Kanpur',state:'Uttar Pradesh',pincode:'208001'}];
export default function Addresses(){ return <div className="addrs"><h2>Saved Addresses</h2>{addrs.map((a,i)=> <div key={i} className="addrs__card"><strong>{a.name} • {a.phone}</strong><p>{a.address}, {a.city}, {a.state} - {a.pincode}</p><div className="addrs__actions"><button>Edit</button><button className="danger">Delete</button></div></div>)}<button className="addrs__add">+ Add New Address</button></div>}
