import { getSession } from '@/lib/auth';
import AuthForm from '@/components/commerce/AuthForm';
import TrackOrderClient from './TrackOrderClient';
import styles from '../account/account.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Track Your Order & Delivery Status — RF Riddhy',
  description: 'Enter your order reference number and mobile number to track real-time delivery status, express logistics transit, and installation scheduling.'
};

export default async function TrackOrderPage() {
  const session = await getSession();

  if (!session) {
    return (
      <main className="container" style={{ paddingBlock: '35px 90px' }}>
        <div className={styles.login}>
          <div className={styles.story}>
            <span className="kicker">Real-time Fulfillment</span>
            <h1>
              Track your
              <br />
              <em>order &amp; transit.</em>
            </h1>
            <p>
              Please sign in to track live delivery transit, carrier updates, and download verified GST tax invoices.
            </p>
            <div>Riddhy Furniture · Thoughtfully Crafted for Indian Homes</div>
          </div>

          <section className={styles.form}>
            <span className="kicker">Authentication Required</span>
            <h2>Sign in to track.</h2>
            <AuthForm />
          </section>
        </div>
      </main>
    );
  }

  return <TrackOrderClient sessionUser={session} />;
}
