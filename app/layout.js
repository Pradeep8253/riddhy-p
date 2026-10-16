import { Fraunces, Manrope, Noto_Sans_Devanagari } from 'next/font/google';
import './styles/globals.css';
import StoreProvider from '@/components/providers/StoreProvider';
import LocaleSync from '@/components/providers/LocaleSync';
import LenisProvider from '@/components/motion/LenisProvider';
import IntroPreloader from '@/components/motion/IntroPreloader';
import SceneRootLoader from '@/components/three/SceneRootLoader';
import { IMG } from '@/lib/images';

const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });
const noto = Noto_Sans_Devanagari({ subsets: ['devanagari'], variable: '--font-noto', display: 'swap' });

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: { default: 'RF Riddhy | Furniture & Home Appliances', template: '%s | RF Riddhy' },
  description: 'Thoughtfully chosen furniture and dependable home appliances for a more beautiful, comfortable home.',
  applicationName: 'RF Riddhy',
  openGraph: { type: 'website', siteName: 'RF Riddhy', title: 'RF Riddhy — Furniture & Home Appliances', description: 'आपके घर की समृद्धि', images: [IMG.og] },
  icons: { icon: '/icons/favicon.svg', apple: '/icons/favicon.svg' }
};

export const viewport = { themeColor: '#f3eee6', colorScheme: 'light' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable} ${noto.variable}`}>
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
