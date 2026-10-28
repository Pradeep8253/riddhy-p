import Hero from "@/components/store/Hero";
import HomePromotionalBanner from "@/components/store/HomePromotionalBanner";
import WarrantyBanner from "@/components/store/WarrantyBanner";
import Marquee from "@/components/store/Marquee";
import RoomCards from "@/components/store/RoomCards";
import ShopByAppliance from "@/components/store/ShopByAppliance";
import TagRail from "@/components/store/TagRail";
import CampaignSection from "@/components/store/CampaignSection";
import WarrantyPromise from "@/components/store/WarrantyPromise";
import DeliveryTimeline from "@/components/store/DeliveryTimeline";
import ReviewWall from "@/components/store/ReviewWall";
import ServiceabilityChecker from "@/components/store/ServiceabilityChecker";
import ShopTheLookHotspots from "@/components/store/ShopTheLookHotspots";
import RoomPlaygroundLoader from "@/components/three/RoomPlaygroundLoader";
import ExploreOurRange from "@/components/store/ExploreOurRange";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import {
  getProductsByTag,
  getProducts,
  getCatalogProduct,
  getCategories,
  getCampaigns,
  getCatalogue,
  getHeroBanners,
  getCuratedLook,
} from "@/lib/catalogue";

export const revalidate = 0;

export const metadata = {
  title: "Furniture & Home Appliances for Thoughtful Living",
  description:
    "Explore room-ready furniture and dependable home appliances, with delivery, installation and warranty details made clear.",
};

export default async function HomePage() {
  const [
    catalogueProducts,
    bestsellers,
    trending,
    newArrivals,
    allCategories,
    heroBanners,
    curatedLook,
    playgroundPiecesResult,
    heroBannersData,
  ] = await Promise.all([
    getCatalogue(),
    getProductsByTag("best-selling", 10),
    getProductsByTag("trending", 10),
    getProductsByTag("new-arrival", 10),
    getCategories(),
    getCampaigns("home-hero"),
    getCuratedLook("living"),
    getProducts({ limit: 4 }),
    getHeroBanners(),
  ]);

  const applianceCategories = allCategories.filter(
    (c) => c.type === "appliance" || c.type === "appliances",
  );

  return (
    <>
      <Hero
        initialSlides={heroBannersData?.slides || []}
        initialSideCards={heroBannersData?.sideCards || []}
      />
      {/* Explore Our Range - Harivan Organics Style for Furnitures, Appliances & Utensils */}
      <ExploreOurRange
        allProducts={catalogueProducts}
        categories={allCategories}
      />

      {/* Old hero section */}
      {/* <HomePromotionalBanner initialBanners={heroBanners} /> */}
      <WarrantyBanner />
      <Marquee />

      {/* 1. Shop by room */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="Shop by room"
            title="Start with the room you’re shaping."
            description="Layer furniture, light and useful details into a space that feels like yours."
            action={
              <Button href="/rooms/living" variant="outline">
                Explore all rooms <Icon name="arrowUpRight" size={15} />
              </Button>
            }
          />
          <RoomCards />
        </div>
      </section>

      {/* 2. Target UX Bestsellers Rail */}
      <TagRail
        eyebrow="Bestsellers, thoughtfully picked"
        title="The pieces people come back to."
        tag="best-selling"
        viewAllHref="/collections/best-selling"
        products={bestsellers}
        className="bg-light-yellow"
        autoSlide={true}
        autoSlideInterval={2500}
      />

      {/* 3. ShopByAppliance */}
      <ShopByAppliance
        categories={applianceCategories}
        className="bg-light-green"
      />

      {/* 4. Trending Rail */}
      <TagRail
        eyebrow="Trending this season"
        title="In demand for modern spaces."
        tag="trending"
        viewAllHref="/collections/trending"
        products={trending}
        className="bg-white"
        autoSlide={true}
        autoSlideInterval={2500}
      />

      {/* 5. Curated Living */}
      <section className="section bg-light-yellow">
        <div className="container">
          <SectionHeading
            eyebrow="Curated Living"
            title="Shop the look, piece by piece."
            description="Explore our signature living space. Tap any piece to view details or add directly to your bag."
            action={
              <Button href="/furniture" variant="ghost">
                Browse collection <Icon name="arrowUpRight" size={15} />
              </Button>
            }
          />
          <ShopTheLookHotspots
            look={curatedLook}
          />
        </div>
      </section>

      {/* 6. Interactive Room Layout */}
      <section className="section bg-light-green">
        <div className="container">
          <SectionHeading
            eyebrow="Interactive Room Layout"
            title="Try a room, piece by piece."
            description="Arrange furniture in an interactive 3D space and preview your layout in real time. Your delivery options depend on your pincode."
          />
          <RoomPlaygroundLoader
            catalogue={playgroundPiecesResult?.items || []}
          />
        </div>
      </section>

      {/* Golden Hour campaign section */}
      {/* <CampaignSection campaign={heroBanners?.[0]} /> */}

      {/* 7. New Arrivals Rail */}
      <TagRail
        eyebrow="Fresh in the showroom"
        title="New arrivals for your space."
        tag="new-arrival"
        viewAllHref="/collections/new-arrival"
        products={newArrivals}
        className="bg-white"
        autoSlide={true}
        autoSlideInterval={2500}
      />

      {/* 8. Warranty Promise */}
      <WarrantyPromise className="bg-light-yellow" />

      {/* 9. Delivery & installation */}
      <section className="section bg-light-green">
        <div className="container">
          <SectionHeading
            eyebrow="Delivery & installation"
            title="From your shortlist to your space."
            description="Clear options at every step. Exact dates, charges and installation eligibility are shown for the chosen product and pincode."
          />
          <DeliveryTimeline />
        </div>
      </section>

      {/* 10. Homes, in their own words */}
      <section className="section bg-white">
        <div className="container">
          <SectionHeading
            eyebrow="Homes, in their own words"
            title="A space for real customer stories."
            description="Stories from families who made their homes with RF Riddhy."
          />
          <ReviewWall />
        </div>
      </section>

      {/* 11. Serviceability Checker */}
      {/* <section className="section bg-light-yellow">
        <div className="container">
          <ServiceabilityChecker />
        </div>
      </section> */}
    </>
  );
}
