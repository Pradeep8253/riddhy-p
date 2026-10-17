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
import { getProductsByTag } from '@/lib/catalogue';

export const metadata = {
  title: 'Furniture & Home Appliances for Thoughtful Living',
  description: 'Explore room-ready furniture and dependable home appliances, with delivery, installation and warranty details made clear.'
};

export default async function HomePage() {
  const bestsellers = await getProductsByTag('best-selling', 10);
  const trending = await getProductsByTag('trending', 10);
  const newArrivals = await getProductsByTag('new-arrival', 10);

  return (
    <>
      <HomePromotionalBanner />
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

      <ShopByAppliance />

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
            action={<Button href="/consultation" variant="ghost">Plan my room <Icon name="arrowUpRight" size={15} /></Button>}
          />
          <ShopTheLookHotspots />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Interactive Room Layout"
            title="Try a room, piece by piece."
            description="Arrange furniture in an interactive 3D space and preview your layout in real time. Your delivery options depend on your pincode."
          />
          <RoomPlaygroundLoader />
        </div>
      </section>

      <CampaignSection />

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

