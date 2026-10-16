import Link from 'next/link';
import './Breadcrumb.css';
export default function Breadcrumb({ items=[] }){
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((it,i)=>(
        <span key={i} className="breadcrumb__item">
          {it.href ? <Link href={it.href} className="breadcrumb__link">{it.label}</Link> : <span className="breadcrumb__current">{it.label}</span>}
          {i < items.length-1 && <span className="breadcrumb__sep">/</span>}
        </span>
      ))}
    </nav>
  );
}
