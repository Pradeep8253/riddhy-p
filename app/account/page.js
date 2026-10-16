import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getSession } from '@/lib/auth';
import AuthForm from '@/components/commerce/AuthForm';
import AccountDashboard from '@/components/commerce/AccountDashboard';
import styles from './account.module.css';

export const metadata = {
  title: 'Your account',
  robots: { index: false, follow: false }
};

export default async function AccountPage() {
  const session = await getSession();
  if (session && session.role !== 'customer') redirect('/admin');

  return (
    <main className="container" style={{ paddingBlock: '35px 90px' }}>
      {session ? (
        <>
          <div className={styles.topNav}>
            <Link href="/" className={styles.backHomeBtn}>
              <ArrowLeft size={15} strokeWidth={2.2} />
              <span>Back to Storefront</span>
            </Link>
          </div>
          <span className="kicker">Your Riddhy account</span>
          <h1 className="display-title" style={{ marginBottom: 28 }}>
            A little more care,
            <br />
            all in one place.
          </h1>
          <AccountDashboard user={{ name: session.name || 'Welcome back', email: session.email || '' }} />
        </>
      ) : (
        <>
          <div className={styles.topNav}>
            <Link href="/" className={styles.backHomeBtn}>
              <ArrowLeft size={15} strokeWidth={2.2} />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className={styles.login}>
            <div className={styles.story}>
              <span className="kicker">Welcome to Riddhy</span>
              <h1>
                Your home,
                <br />
                <em>your account.</em>
              </h1>
              <p>Keep orders, delivery updates and registered warranties together in one helpful place.</p>
              <div>रिद्धि फर्नीचर · आपके घर की समृद्धि</div>
            </div>

            <section className={styles.form}>
              <span className="kicker">Sign in or join us</span>
              <h2>Welcome back.</h2>
              <AuthForm />
              <div className={styles.backHomeRow}>
                <Link href="/" className={styles.bottomBackLink}>
                  ← Return to Storefront
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
