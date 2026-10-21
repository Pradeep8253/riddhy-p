import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ToastViewport from '@/components/store/ToastViewport';
import StickyConsultationPill from '@/components/store/StickyConsultationPill';
import FloatingContactWidget from '@/components/ui/FloatingContactWidget';
import CartDrawer from '@/components/commerce/CartDrawer';
import MobileBottomNav from '@/components/store/MobileBottomNav';
import OffersModal from '@/components/store/OffersModal';

export default function StoreLayout({ children }) {
  return (
    <>
      <Header />
      <div>{children}</div>
      <Footer />
      <ToastViewport />
      <CartDrawer />
      <OffersModal />
      <StickyConsultationPill />
      <FloatingContactWidget />
      <MobileBottomNav />
    </>
  );
}
