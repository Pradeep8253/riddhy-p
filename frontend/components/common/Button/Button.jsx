'use client';
import './Button.css';
export default function Button({ children, variant='primary', size='md', loading=false, icon, className='', ...props }){
  return (
    <button className={`btn btn--${variant} btn--${size} ${loading?'btn--loading':''} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading && <span className="btn__spinner" aria-hidden/>}
      {icon && <span className="btn__icon">{icon}</span>}
      <span className="btn__label">{children}</span>
    </button>
  );
}
