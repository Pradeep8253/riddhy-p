const paths = {
  search: <><circle cx="11" cy="11" r="7"/><path d="m16 16 5 5"/></>,
  bag: <><path d="M5 8h14l1 13H4L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
  heart: <path d="M20.8 8.8c0 5.5-8.8 11.2-8.8 11.2S3.2 14.3 3.2 8.8A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.6Z"/>,
  user: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  close: <><path d="m6 6 12 12M18 6 6 18"/></>,
  arrow: <><path d="M4 12h15"/><path d="m13 5 7 7-7 7"/></>,
  chevron: <path d="m7 10 5 5 5-5"/>,
  plus: <><path d="M12 5v14M5 12h14"/></>,
  minus: <path d="M5 12h14"/>,
  compare: <><path d="M8 4H4v16h4M16 4h4v16h-4M9 8h6m-6 4h6m-6 4h6"/></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  truck: <><path d="M3 6h11v12H3zM14 10h4l3 3v5h-7"/><circle cx="7" cy="19" r="1.7"/><circle cx="18" cy="19" r="1.7"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.2l-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  gift: <><rect x="3" y="9" width="18" height="12" rx="2"/><path d="M12 9v12M3 13h18M12 9H7.5a2.5 2.5 0 1 1 2.5-2.5V9Zm0 0h4.5A2.5 2.5 0 1 0 14 6.5V9Z"/></>,
  instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></>
};
export default function Icon({ name, size = 20, strokeWidth = 1.7, label, className = '' }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : 'true'}>{paths[name] || paths.check}</svg>;
}
