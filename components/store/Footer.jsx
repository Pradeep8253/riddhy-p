'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { setLiteMode, setLocale } from '@/store/uiSlice';
import Icon from '@/components/ui/Icon';
import { tr } from '@/lib/i18n';
import styles from './Footer.module.css';

const groups = [
  { title:'Shop', links:[['Furniture','/furniture'],['Home appliances','/appliances'],['Shop by room','/rooms/living'],['Current offers','/offers']] },
  { title:'Care & support', links:[['Delivery & installation','/policies/shipping'],['Returns & refunds','/policies/returns'],['Warranty','/policies/warranty'],['FAQs','/faq']] },
  { title:'About Riddhy', links:[['Our story','/about'],['Contact us','/contact'],['Bulk & trade','/bulk-enquiry'],['Privacy','/policies/privacy']] }
];
export default function Footer() {
  const dispatch=useDispatch();
  const liteMode=useSelector((state)=>state.ui.liteMode);
  const locale=useSelector((state)=>state.ui.locale);
  const toggleLite=()=>{const next=!liteMode;dispatch(setLiteMode(next));window.localStorage.setItem('rf-lite-mode',next?'1':'0');window.dispatchEvent(new CustomEvent('rf-lite-mode',{detail:next}));};
  return <footer className={styles.footer}>
    <div className={styles.footerTop}>
      <div className={styles.brandCol}><Link href="/" className={styles.brand}><span className={styles.mark}>RF</span><span><b>RIDDHY</b><small>FURNITURE & HOME APPLIANCES</small></span></Link><p>Thoughtful furniture. Dependable appliances. A little more ease in every corner.</p><p className={styles.hindi}>आपके घर की समृद्धि</p></div>
      {groups.map((group)=><div className={styles.linkGroup} key={group.title}><h3>{group.title}</h3>{group.links.map(([label,href])=><Link href={href} key={href}>{label}</Link>)}</div>)}
      <div className={styles.promise}><span className={styles.promiseLabel}>A Riddhy promise</span><strong>Made for living.<br/>Here for the long run.</strong><p>Clear delivery, careful installation and practical aftercare—before and after you order.</p><Link href="/contact">Talk to our team <Icon name="arrow" size={16}/></Link></div>
    </div>
    <div className={styles.wordmark} aria-hidden="true">RIDDHY</div>
    <div className={styles.footerBottom}><span>© {new Date().getFullYear()} RF Riddhy. All rights reserved.</span><div className={styles.bottomLinks}><Link href="/policies/terms">Terms</Link><Link href="/policies/privacy">Privacy</Link><Link href="/policies/gst">GST information</Link></div><div className={styles.toggles}><button type="button" onClick={()=>dispatch(setLocale(locale==='en'?'hi':'en'))}>{locale==='en'?'EN · हिन्दी':'हिन्दी · EN'}</button><button type="button" aria-pressed={liteMode} onClick={toggleLite}>{liteMode?tr(locale,'liteOn'):tr(locale,'reduceMotion')}</button></div></div>
  </footer>;
}
