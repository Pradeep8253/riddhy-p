import './AddressCard.css';
export default function AddressCard({ addr, selected, onSelect }){
  return <div className={`acard ${selected?'acard--active':''}`} onClick={onSelect}><div className="acard__head"><strong>{addr.name}</strong><span>{addr.phone}</span></div><p>{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p></div>
}
