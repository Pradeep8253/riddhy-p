import Image from 'next/image';
import AuthForm from '@/components/commerce/AuthForm';
import Icon from '@/components/ui/Icon';
import { IMG } from '@/lib/images';
import styles from './login.module.css';

export const metadata = {
  title: 'Admin sign in',
  robots: { index: false, follow: false }
};

export default function AdminLoginPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <span className="kicker">RF Riddhy · secure admin</span>
        <h1>Store operations.</h1>
        <p>Sign in with your administrator credentials to access store operations.</p>
        <AuthForm admin />
        <a href="/" className={styles.back} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="arrowLeft" size={14} /> Return to store
        </a>
      </div>

      <div className={styles.side}>
        <Image
          src={IMG.hero.desktop}
          alt="RF Riddhy furniture and living space"
          fill
          priority
          sizes="(min-width: 800px) 60vw, 100vw"
          className={styles.sideImage}
        />
        <div className={styles.sideOverlay} />
        <div className={styles.sideContent}>
          <div className={styles.sideBadge}>RF RIDDHY OPERATIONS</div>
          <h2>
            Thoughtful Craft.<br />
            <em>Dependable Living.</em>
          </h2>
          <p>
            Central control workspace for catalogue management, order tracking, fulfillment and aftercare claims.
          </p>
        </div>
      </div>
    </main>
  );
}
