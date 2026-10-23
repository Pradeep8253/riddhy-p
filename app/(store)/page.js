import HomePromotionalBanner from '@/components/store/HomePromotionalBanner';
import WarrantyBanner from '@/components/store/WarrantyBanner';
import Marquee from '@/components/store/Marquee';
import RoomCards from '@/components/store/RoomCards';
import ShopByAppliance from '@/components/store/ShopByAppliance';
import TagRail from '@/components/store/TagRail';
import CampaignSection from '@/components/store/CampaignSection';
import WarrantyPromise from '@/components/store/WarrantyPromise';
import DeliveryTimeline from '@/components/store/DeliveryTimeline';
import ReviewWall from '@/components/store/ReviewWall';
import ServiceabilityChecker from '@/components/store/ServiceabilityChecker';
import ShopTheLookHotspots from '@/components/store/ShopTheLookHotspots';
import RoomPlaygroundLoader from '@/components/three/RoomPlaygroundLoader';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { getProductsByTag, getProducts, getCatalogProduct, getCategories, getCampaigns } from '@/lib/catalogue';

export const metadata = {
  title: 'Furniture & Home Appliances for Thoughtful Living',
  description: 'Explore room-ready furniture and dependable home appliances, with delivery, installation and warranty details made clear.'
};

export default async function HomePage() {
  const [
    bestsellers,
    trending,
    newArrivals,
    applianceCategories,
    heroBanners,
    sofaProduct,
    lampProduct,
    consoleProduct,
    playgroundPiecesResult
  ] = await Promise.all([
    getProductsByTag('best-selling', 10),
    getProductsByTag('trending', 10),
    getProductsByTag('new-arrival', 10),
    getCategories('appliances'),
    getCampaigns('home-hero'),
    getCatalogProduct('mira-3-seater-sofa'),
    getCatalogProduct('aangan-accent-lamp'),
    getCatalogProduct('sajilo-shoe-cabinet'),
    getProducts({ type: 'furniture', limit: 8 })
  ]);

  const curatedLook = {
    roomName: 'Curated Living Room',
    tagline: 'Balanced warmth, natural woods, and everyday comfort',
    image: '/images/room-living.webp?v=20261023',
    hotspots: [
      {
        id: 'sofa-hotspot',
        top: '60%',
        left: '50%',
        product: sofaProduct || {
          id: 'demo-mira-3-seater-sofa',
          slug: 'mira-3-seater-sofa',
          sku: 'RF-0101-DEMO',
          name: 'Mira 3-Seater Sofa',
          tagline: 'Soft sage upholstery with solid wood base',
          categoryLabel: 'Sofas & Sectionals',
          price: 50000,
          mrp: 58800,
          image: '/images/products/mira-3-seater-sofa/front.webp'
        }
      },
      {
        id: 'decor-hotspot',
        top: '32%',
        left: '68%',
        product: lampProduct || {
          id: 'demo-aangan-accent-lamp',
          slug: 'aangan-accent-lamp',
          sku: 'RF-0701-DEMO',
          name: 'Aangan Accent Lamp',
          tagline: 'Warm diffused glow for evening calm',
          categoryLabel: 'Home Décor',
          price: 2490,
          mrp: 2990,
          image: '/images/products/aangan-accent-lamp/front.webp'
        }
      },
      {
        id: 'table-hotspot',
        top: '66%',
        left: '14%',
        product: consoleProduct || {
          id: 'demo-sajilo-shoe-cabinet',
          slug: 'sajilo-shoe-cabinet',
          sku: 'RF-0802-DEMO',
          name: 'Sajilo Storage Console',
          tagline: 'Closed storage with warm natural grain',
          categoryLabel: 'Storage & Shelving',
          price: 18990,
          mrp: 23990,
          image: '/images/products/sajilo-shoe-cabinet/front.webp'
        }
      }
    ]
  };

  return (
    <>
      <HomePromotionalBanner initialBanners={heroBanners} />
      <WarrantyBanner />
      <Marquee />

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Shop by room"
            title="Start with the room you’re shaping."
            description="Layer furniture, light and useful details into a space that feels like yours."
            action={<Button href="/rooms/living" variant="outline">Explore all rooms <Icon name="arrowUpRight" size={15} /></Button>}
          />
          <RoomCards />
        </div>
      </section>

      {/* Target UX Bestsellers Rail */}
      <TagRail
        eyebrow="Bestsellers, thoughtfully picked"
        title="The pieces people come back to."
        tag="best-selling"
        viewAllHref="/collections/best-selling"
        products={bestsellers}
      />

      <ShopByAppliance categories={applianceCategories} />

      {/* Trending Rail */}
      <TagRail
        eyebrow="Trending this season"
        title="In demand for modern spaces."
        tag="trending"
        viewAllHref="/collections/trending"
        products={trending}
      />

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Curated Living"
            title="Shop the look, piece by piece."
            description="Explore our signature living space. Tap any piece to view details or add directly to your bag."
            action={<Button href="/furniture" variant="ghost">Browse collection <Icon name="arrowUpRight" size={15} /></Button>}
          />
          <ShopTheLookHotspots look={curatedLook} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Interactive Room Layout"
            title="Try a room, piece by piece."
            description="Arrange furniture in an interactive 3D space and preview your layout in real time. Your delivery options depend on your pincode."
          />
          <RoomPlaygroundLoader catalogue={playgroundPiecesResult?.items || []} />
        </div>
      </section>

      <CampaignSection campaign={heroBanners?.[0]} />

      {/* New Arrivals Rail */}
      <TagRail
        eyebrow="Fresh in the showroom"
        title="New arrivals for your space."
        tag="new-arrival"
        viewAllHref="/collections/new-arrival"
        products={newArrivals}
      />

      <WarrantyPromise />

      <section className="section" style={{ background: 'linear-gradient(180deg, #f3eee6, #fbf8f2)' }}>
        <div className="container">
          <SectionHeading
            eyebrow="Delivery & installation"
            title="From your shortlist to your space."
            description="Clear options at every step. Exact dates, charges and installation eligibility are shown for the chosen product and pincode."
          />
          <DeliveryTimeline />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Homes, in their own words"
            title="A space for real customer stories."
            description="Stories from families who made their homes with RF Riddhy."
          />
          <ReviewWall />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <ServiceabilityChecker />
        </div>
      </section>
    </>
  );
}

