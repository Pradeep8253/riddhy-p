export default function BrandMark({ size = 48, className = '', title = 'RF Riddhy' }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rf-gold" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#edb95e"/><stop offset="1" stopColor="#c48620"/></linearGradient>
        <linearGradient id="rf-green" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#6b8f5e"/><stop offset="1" stopColor="#1f5f2e"/></linearGradient>
      </defs>
      <path d="M11 17h39c15 0 23 8 23 20 0 9-5 15-13 18l18 22H54L38 55H26v22H11V17zm15 13v12h22c6 0 9-2 9-6s-3-6-9-6H26z" fill="url(#rf-gold)"/>
      <path d="M52 17h37v13H67v9h20v12H67v26H52V17z" fill="url(#rf-green)"/>
      <path d="M13 81c18 11 54 11 75-4" fill="none" stroke="url(#rf-gold)" strokeWidth="4" strokeLinecap="round"/>
      <circle cx="82" cy="75" r="3" fill="#2e7d32"/>
    </svg>
  );
}
