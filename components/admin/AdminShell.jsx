'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './AdminShell.module.css';
const links=[['Overview','/admin'],['Catalogue','/admin/catalogue'],['Inventory','/admin/inventory'],['Orders','/admin/orders'],['CMS & campaigns','/admin/cms'],['Enquiries','/admin/leads'],['Reports','/admin/reports']];
export default function AdminShell({children}){const pathname=usePathname(),router=useRouter(),[busy,setBusy]=useState(false);if(pathname==='/admin/login')return children;const signOut=async()=>{setBusy(true);try{await fetch('/api/auth/logout',{method:'POST'});router.replace('/admin/login');router.refresh()}finally{setBusy(false)}};return <div className={styles.shell}><header className={styles.header}><Link href="/" className={styles.brand}><span>RF</span><b>RIDDHY <small>OPERATIONS</small></b></Link><nav aria-label="Admin navigation">{links.map(([label,href])=><Link key={href} className={pathname===href?styles.active:''} href={href}>{label}</Link>)}</nav><button type="button" disabled={busy} onClick={signOut}>{busy?'Signing out…':'Sign out'}</button></header><main className={styles.main}>{children}</main></div>}
