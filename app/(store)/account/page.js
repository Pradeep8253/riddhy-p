import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import AuthForm from '@/components/commerce/AuthForm';
import AccountDashboard from '@/components/commerce/AccountDashboard';
import styles from './account.module.css';

export const metadata = {
  title: 'Your Account — RF Riddhy',
  description: 'Manage your RF Riddhy orders, track live shipments, download tax invoices, and check product warranty coverage.',
  robots: { index: false, follow: false }
};

export default async function AccountPage() {
  const session = await getSession();
  if (session && session.role !== 'customer') redirect('/admin');

  return (
    <main className="container" style={{ paddingBlock: '35px 90px' }}>
      {session ? (
        <>
          <span className="kicker">Your Riddhy account</span>
          <h1 className="display-title" style={{ marginBottom: 28 }}>
            A little more care,
            <br />
            all in one place.
          </h1>
          <AccountDashboard user={{ name: session.name || 'Welcome back', email: session.email || '' }} />
        </>
      ) : (
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
          </section>
        </div>
      )}
    </main>
  );
}
