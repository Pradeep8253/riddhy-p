'use client';

export default function ExplodeView({ value = 0, onChange = () => {} }) {
  return <label style={{ display: 'grid', gap: 6, fontSize: 12, fontWeight: 700 }}>Explore the construction <input type="range" min="0" max="1" step="0.01" value={value} onChange={(event) => onChange(Number(event.target.value))} aria-label="Separate product components" /></label>;
}
