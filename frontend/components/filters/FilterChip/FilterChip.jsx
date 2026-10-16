import './FilterChip.css';
export default function FilterChip({ label, onRemove }){ return <span className="fchip">{label}<button onClick={onRemove}>✕</button></span> }
