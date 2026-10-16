'use client';

import { Html } from '@react-three/drei';
const defaults = [{ position: [0,.7,.45], label: 'Thoughtful, durable finish' }, { position: [.55,-.12,.45], label: 'Designed for everyday use' }];
export default function Hotspots({ items = defaults, onSelect = () => {} }) {
  return items.map((item) => <Html key={item.label} position={item.position} center distanceFactor={4} occlude><button type="button" onClick={() => onSelect(item)} style={{ border: '1px solid rgba(31,95,46,.25)', borderRadius: 999, padding: '8px 11px', background: 'rgba(251,248,242,.94)', color: '#1e2420', whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,.12)', cursor: 'pointer', fontSize: 11 }}>{item.label}</button></Html>);
}
