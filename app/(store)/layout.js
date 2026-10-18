import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ToastViewport from '@/components/store/ToastViewport';
import StickyConsultationPill from '@/components/store/StickyConsultationPill';
import FloatingContactWidget from '@/components/ui/FloatingContactWidget';
import CartDrawer from '@/components/commerce/CartDrawer';
import MobileBottomNav from '@/components/store/MobileBottomNav';

export default function StoreLayout({ children }) {
  return (
    <>
      <Header />
      <div>{children}</div>
      <Footer />
      <ToastViewport />
      <CartDrawer />
      <StickyConsultationPill />
      <FloatingContactWidget />
      <MobileBottomNav />
    </>
  );
}
