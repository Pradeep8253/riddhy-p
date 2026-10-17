import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getDemoProducts } from '@/lib/demo-data';
import { IMG } from '@/lib/images';
import ProductGrid from '@/components/ui/ProductGrid';
import SectionHeading from '@/components/ui/SectionHeading';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import styles from './room.module.css';

const titles = {
  living: 'Living room',
  bedroom: 'Bedroom',
  dining: 'Dining room',
  study: 'Study & work',
  kitchen: 'Kitchen & utility'
};

export async function generateMetadata({ params }) {
  const { room } = await params;
  return {
    title: `${titles[room] || 'Room'} inspiration`,
    description: 'A room-first edit of furniture and helpful home appliances from RF Riddhy.'
  };
}

export default async function RoomPage({ params }) {
  const { room } = await params;
  if (!titles[room]) notFound();
  const image = IMG.rooms.find((item) => item.slug === room) || IMG.rooms[0];
  const products = getDemoProducts().filter((item) => item.room === room).slice(0, 12);

  return (
    <>
      <section className={styles.hero}>
        <Image src={image.src} alt={image.alt} fill priority sizes="100vw" unoptimized />
        <div className={styles.scrim} />
        <div className="container">
          <span className="kicker">Room edit · RF Riddhy</span>
          <h1>
            {titles[room]}<br />
            <em>in balance.</em>
          </h1>
          <p>Start with the way you live. Layer in the pieces that make the room feel right.</p>
          <Button href="/furniture" variant="gold">
            Explore furniture <Icon name="arrowUpRight" size={15} />
          </Button>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Shop this room"
            title="A thoughtful starting point."
            description="Demo assortment for inspiration. Check exact dimensions and pincode service options on each product."
          />
          <ProductGrid products={products} />
        </div>
      </section>

      <div className={styles.bottom}>
        <Link href="/appliances">
          Explore appliances for this room <Icon name="arrow" size={15} />
        </Link>
      </div>
    </>
  );
}
