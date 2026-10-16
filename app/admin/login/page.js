import AuthForm from '@/components/commerce/AuthForm';
import styles from './login.module.css';
export const metadata={title:'Admin sign in',robots:{index:false,follow:false}};
export default function AdminLoginPage(){return <main className={styles.page}><div className={styles.card}><span className="kicker">RF Riddhy · secure admin</span><h1>Store operations.</h1><p>Sign in with an administrator account seeded in your database.</p><AuthForm admin/><a href="/" className={styles.back}>← Return to storefront</a></div><div className={styles.side}><span>RF</span><b>RIDDHY</b><small>FURNITURE & HOME APPLIANCES</small></div></main>}
