import HomeHero from '@/components/store/HomeHero';
import Marquee from '@/components/store/Marquee';
import RoomCards from '@/components/store/RoomCards';
import ShopByAppliance from '@/components/store/ShopByAppliance';
import ProductRail from '@/components/store/ProductRail';
import CampaignSection from '@/components/store/CampaignSection';
import WarrantyPromise from '@/components/store/WarrantyPromise';
import DeliveryTimeline from '@/components/store/DeliveryTimeline';
import ReviewWall from '@/components/store/ReviewWall';
import ServiceabilityChecker from '@/components/store/ServiceabilityChecker';
import RoomPlaygroundLoader from '@/components/three/RoomPlaygroundLoader';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import { getDemoProducts } from '@/lib/demo-data';

export const metadata = { title: 'Furniture & Home Appliances for Thoughtful Living', description: 'Explore room-ready furniture and dependable home appliances, with delivery, installation and warranty details made clear.' };

export default function HomePage(){
  const products=getDemoProducts();
  const bestsellers=[products[0],products[8],products[17],products[24],products[30],products[36],products[41],products[12]];
  return <>
    <HomeHero/>
    <Marquee/>
    <section className="section"><div className="container"><SectionHeading eyebrow="Shop by room" title="Start with the room you’re shaping." description="Layer furniture, light and useful details into a space that feels like yours." action={<Button href="/rooms/living" variant="outline">Explore all rooms <span>↗</span></Button>}/><RoomCards/></div></section>
    <section className="section" style={{paddingTop:0}}><div className="container"><SectionHeading eyebrow="Bestsellers, thoughtfully picked" title="The pieces people come back to." description="A demo assortment with dimensions, price and delivery details ready to explore." action={<Button href="/furniture" variant="ghost">Shop all furniture <span>↗</span></Button>}/><ProductRail products={bestsellers}/></div></section>
    <ShopByAppliance/>
    <section className="section"><div className="container"><SectionHeading eyebrow="Make the space work harder" title="Try a room, piece by piece." description="Drop a few demo pieces into a small 3D room and see a live basket total. Your final delivery options depend on your pincode."/><RoomPlaygroundLoader/></div></section>
    <CampaignSection/>
    <WarrantyPromise/>
    <section className="section" style={{background:'linear-gradient(180deg,#f3eee6,#fbf8f2)'}}><div className="container"><SectionHeading eyebrow="Delivery & installation" title="From your shortlist to your space." description="Clear options at every step. Exact dates, charges and installation eligibility are shown for the chosen product and pincode."/><DeliveryTimeline/></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="Homes, in their own words" title="A space for real customer stories." description="Verified-purchase photos and reviews will appear here after moderation. The cards below are illustrative layouts, not customer testimonials."/><ReviewWall/></div></section>
    <section className="section" style={{paddingTop:0}}><div className="container"><ServiceabilityChecker/></div></section>
  </>;
}
