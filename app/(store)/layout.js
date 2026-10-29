import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ToastViewport from '@/components/store/ToastViewport';
import FloatingContactWidget from '@/components/ui/FloatingContactWidget';
import CartDrawer from '@/components/commerce/CartDrawer';
import MobileBottomNav from '@/components/store/MobileBottomNav';
import OffersModal from '@/components/store/OffersModal';
import { getLiveSiteConfig } from '@/lib/server-config';
import { getCategories } from '@/lib/catalogue';

export default async function StoreLayout({ children }) {
  const [liveConfig, categories] = await Promise.all([
    getLiveSiteConfig(),
    getCategories().catch(() => []),
  ]);

  return (
    <>
      <Header config={liveConfig} initialCategories={categories} />
      <div>{children}</div>
      <Footer config={liveConfig} />
      <ToastViewport />
      <CartDrawer />
      <OffersModal />
      <FloatingContactWidget config={liveConfig} />
      <MobileBottomNav config={liveConfig} />
    </>
  );
}
