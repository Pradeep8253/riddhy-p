import HeroSlider from '@/components/home/HeroSlider/HeroSlider';
import CategoryGrid from '@/components/home/CategoryGrid/CategoryGrid';
import DealsOfTheDay from '@/components/home/DealsOfTheDay/DealsOfTheDay';
import BestSellers from '@/components/home/BestSellers/BestSellers';
import RoomInspiration from '@/components/home/RoomInspiration/RoomInspiration';
import ApplianceDeals from '@/components/home/ApplianceDeals/ApplianceDeals';
import BrandStrip from '@/components/home/BrandStrip/BrandStrip';
import TrustBadges from '@/components/home/TrustBadges/TrustBadges';
import Testimonials from '@/components/home/Testimonials/Testimonials';
import Newsletter from '@/components/home/Newsletter/Newsletter';
import ScrollReveal from '@/components/motion/ScrollReveal/ScrollReveal';
import './page.css';

export default function Home(){
  return (
    <div className="home">
      <HeroSlider/>
      <ScrollReveal><CategoryGrid/></ScrollReveal>
      <ScrollReveal><DealsOfTheDay/></ScrollReveal>
      <ScrollReveal><BestSellers/></ScrollReveal>
      <ScrollReveal><RoomInspiration/></ScrollReveal>
      <ScrollReveal><ApplianceDeals/></ScrollReveal>
      <BrandStrip/>
      <TrustBadges/>
      <Testimonials/>
      <Newsletter/>
    </div>
  );
}
