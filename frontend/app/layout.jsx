import './globals.css';
import SmoothScrollProvider from '@/components/motion/SmoothScrollProvider/SmoothScrollProvider';
import PageTransition from '@/components/motion/PageTransition/PageTransition';
import Header from '@/components/layout/Header/Header';
import AnnouncementBar from '@/components/layout/AnnouncementBar/AnnouncementBar';
import CategoryNav from '@/components/layout/CategoryNav/CategoryNav';
import Footer from '@/components/layout/Footer/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav/MobileBottomNav';
import CompareBar from '@/components/product/CompareBar/CompareBar';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CompareProvider } from '@/context/CompareContext';
import { ToastProvider } from '@/components/common/Toast/ToastProvider';

export const metadata = {
  title: 'RF Riddhy — Furniture & Home Appliances | Premium, Warm, Trusted',
  description: 'Shop Sofas, Beds, Dining, Wardrobes & Appliances. Free installation, 3-year warranty, Razorpay secure payments, EMI & COD. Kanpur & 120+ cities.',
};

export default function RootLayout({ children }){
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <WishlistProvider>
            <CompareProvider>
              <CartProvider>
                <ToastProvider>
                  <SmoothScrollProvider>
                    <AnnouncementBar/>
                    <Header/>
                    <CategoryNav/>
                    <PageTransition>
                      <main style={{paddingBottom:'70px'}}>{children}</main>
                    </PageTransition>
                    <CompareBar/>
                    <Footer/>
                    <MobileBottomNav/>
                  </SmoothScrollProvider>
                </ToastProvider>
              </CartProvider>
            </CompareProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
