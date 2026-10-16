import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ToastViewport from '@/components/store/ToastViewport';
import StickyConsultationPill from '@/components/store/StickyConsultationPill';
import FloatingContactWidget from '@/components/ui/FloatingContactWidget';

export default function StoreLayout({ children }) {
  return (
    <>
      <Header />
      <div>{children}</div>
      <Footer />
      <ToastViewport />
      <StickyConsultationPill />
      <FloatingContactWidget />
    </>
  );
}
