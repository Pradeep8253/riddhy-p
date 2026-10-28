import localFont from 'next/font/local';
import './styles/globals.css';
import StoreProvider from '@/components/providers/StoreProvider';
import LocaleSync from '@/components/providers/LocaleSync';
import LenisProvider from '@/components/motion/LenisProvider';
import IntroPreloader from '@/components/motion/IntroPreloader';
import SceneRootLoader from '@/components/three/SceneRootLoader';
import { getFurnitureStoreSchema, getWebSiteSchema } from '@/lib/seo';

const playfair = localFont({
  src: './fonts/playfair-display.woff2',
  variable: '--font-playfair',
  display: 'swap',
  weight: '400 900',
});

const manrope = localFont({
  src: './fonts/manrope.woff2',
  variable: '--font-manrope',
  display: 'swap',
  weight: '200 800',
});

const noto = localFont({
  src: './fonts/noto-sans-devanagari.woff2',
  variable: '--font-noto',
  display: 'swap',
  weight: '100 900',
});

const resolveBaseUrl = () => {
  const envVal = process.env.NEXT_PUBLIC_SITE_URL;
  if (envVal) {
    try {
      const u = new URL(envVal);
      if (u.protocol === 'http:' || u.protocol === 'https:') return u;
    } catch {}
  }
  return new URL('https://www.riddhyfurnitures.in');
};

export const metadata = {
  metadataBase: resolveBaseUrl(),
  title: {
    default: 'Riddhy Furnitures | Best Furniture & Home Appliances Shop in Prayagraj',
    template: '%s | Riddhy Furnitures Prayagraj',
  },
  description:
    'Best furniture showroom & home appliances store in Prayagraj & Mansoorabad (229411). Solid wood double beds, sofa sets, almirahs, dining tables, utensils & wedding packages with free doorstep delivery.',
  applicationName: 'Riddhy Furnitures',
  keywords: [
    'furniture shop in Prayagraj',
    'furniture showroom in Prayagraj',
    'sofa shop in Prayagraj',
    'double bed in Prayagraj',
    'almirah shop in Prayagraj',
    'furniture shop in Mansoorabad',
    'wedding furniture packages in Prayagraj',
    'home appliances in Prayagraj',
    'kitchen utensils shop in Prayagraj',
    'Riddhy Furnitures',
    'RF Riddhy',
  ],
  alternates: {
    canonical: 'https://www.riddhyfurnitures.in',
  },
  openGraph: {
    type: 'website',
    siteName: 'Riddhy Furnitures',
    title: 'Riddhy Furnitures | Best Furniture & Home Appliances in Prayagraj',
    description:
      'Explore handcrafted solid wood beds, luxury sofas, almirahs, dining sets, home appliances and wedding packages with free doorstep delivery in Prayagraj & Mansoorabad.',
    images: ['/images/og-image.webp'],
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Riddhy Furnitures | Prayagraj',
    description:
      'Best furniture showroom and home appliances store in Prayagraj. Double beds, sofa sets, almirahs, appliances & wedding packages.',
    images: ['/images/og-image.webp'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: { icon: '/icons/favicon.svg', apple: '/icons/favicon.svg' },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#f3eee6',
  colorScheme: 'light',
};

export default function RootLayout({ children }) {
  const storeSchema = getFurnitureStoreSchema();
  const webSiteSchema = getWebSiteSchema();

  return (
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      className={`${playfair.variable} ${manrope.variable} ${noto.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([storeSchema, webSiteSchema]).replace(
              /</g,
              '\\u003c',
            ),
          }}
        />
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <StoreProvider>
          <LocaleSync />
          <LenisProvider>
            <SceneRootLoader />
            <IntroPreloader />
            <div className="site-shell" id="main-content">
              {children}
            </div>
          </LenisProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
