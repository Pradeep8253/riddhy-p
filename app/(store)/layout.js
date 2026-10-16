import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ToastViewport from '@/components/store/ToastViewport';

export default function StoreLayout({ children }) {
  return <><Header /><div>{children}</div><Footer /><ToastViewport /></>;
}
