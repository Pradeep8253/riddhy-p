import localFont from 'next/font/local';
import './styles/globals.css';
import StoreProvider from '@/components/providers/StoreProvider';
import LocaleSync from '@/components/providers/LocaleSync';
import LenisProvider from '@/components/motion/LenisProvider';
import IntroPreloader from '@/components/motion/IntroPreloader';
import SceneRootLoader from '@/components/three/SceneRootLoader';
import { IMG } from '@/lib/images';

const playfair = localFont({
  src: './fonts/playfair-display.woff2',
  variable: '--font-playfair',
  display: 'swap',
  weight: '400 900'
});

const manrope = localFont({
  src: './fonts/manrope.woff2',
  variable: '--font-manrope',
  display: 'swap',
  weight: '200 800'
});

const noto = localFont({
  src: './fonts/noto-sans-devanagari.woff2',
  variable: '--font-noto',
  display: 'swap',
  weight: '100 900'
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'RF Riddhy | Furniture & Home Appliances', template: '%s | RF Riddhy' },
  description: 'Thoughtfully chosen furniture and dependable home appliances for a more beautiful, comfortable home.',
  applicationName: 'RF Riddhy',
  openGraph: { type: 'website', siteName: 'RF Riddhy', title: 'RF Riddhy — Furniture & Home Appliances', description: 'Thoughtfully chosen furniture and dependable home appliances for a more beautiful, comfortable home.', images: [IMG.og] },
  icons: { icon: '/icons/favicon.svg', apple: '/icons/favicon.svg' }
};

export const viewport = { themeColor: '#f3eee6', colorScheme: 'light' };

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" data-scroll-behavior="smooth" className={`${playfair.variable} ${manrope.variable} ${noto.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"Organization",name:'RF Riddhy',url:process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000',logo:`${process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000'}/riddhy-logo.jpeg`}).replace(/</g,'\\u003c')}} />
        <a className="skip-link" href="#main-content">Skip to content</a>
        <StoreProvider>
          <LocaleSync />
          <LenisProvider>
            <SceneRootLoader />
            <IntroPreloader />
            <div className="site-shell" id="main-content">{children}</div>
          </LenisProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
