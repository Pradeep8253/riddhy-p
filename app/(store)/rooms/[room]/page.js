import { notFound, permanentRedirect } from 'next/navigation';
import { getCatalogue } from '@/lib/catalogue';
import RoomPageClient from '@/components/store/RoomPageClient';
import { getCanonicalUrl, getBreadcrumbSchema } from '@/lib/seo';

const titles = {
  living: 'Living room',
  'living-room': 'Living room',
  bedroom: 'Bedroom',
  dining: 'Dining room',
  study: 'Study & work',
  kitchen: 'Kitchen & utility',
};

const roomImages = {
  living: { name: 'Living Room', slug: 'living', src: '/images/room-living.webp?v=20261023', alt: 'Sage and cream living room with a sofa and floor lamp' },
  'living-room': { name: 'Living Room', slug: 'living', src: '/images/room-living.webp?v=20261023', alt: 'Sage and cream living room with a sofa and floor lamp' },
  bedroom: { name: 'Bedroom', slug: 'bedroom', src: '/images/room-bedroom.webp', alt: 'Calm bedroom with a low wooden bed and soft linens' },
  dining: { name: 'Dining', slug: 'dining', src: '/images/room-dining.webp', alt: 'Warm dining room with a solid wood table' },
  study: { name: 'Study', slug: 'study', src: '/images/room-study.webp', alt: 'Bright home study with a desk and task chair' },
  kitchen: { name: 'Kitchen & Utility', slug: 'kitchen', src: '/images/room-kitchen.webp', alt: 'Clean kitchen utility corner with helpful appliances' },
};

export async function generateMetadata({ params }) {
  const { room } = await params;
  const canonicalRoom = room === 'living-room' ? 'living' : room;
  const titleName = titles[canonicalRoom] || 'Room';
  return {
    title: `${titleName} Furniture & Inspiration in Prayagraj`,
    description: `Explore ${titleName.toLowerCase()} furniture, decor and appliances at Riddhy Furnitures Prayagraj with free doorstep delivery and installation.`,
    alternates: {
      canonical: getCanonicalUrl(`/rooms/${canonicalRoom}`),
    },
    openGraph: {
      title: `${titleName} Furniture & Inspiration | Riddhy Furnitures Prayagraj`,
      description: `Explore ${titleName.toLowerCase()} furniture at Riddhy Furnitures Prayagraj.`,
      url: getCanonicalUrl(`/rooms/${canonicalRoom}`),
      images: [roomImages[canonicalRoom]?.src || '/images/og-image.webp'],
    },
  };
}

export default async function RoomPage({ params }) {
  const { room } = await params;
  if (room === 'living-room') {
    permanentRedirect('/rooms/living');
  }
  if (!titles[room]) notFound();
  const image = roomImages[room] || roomImages.living;
  const allProducts = await getCatalogue();
  const products = allProducts.filter((item) => item.room === room).slice(0, 24);

  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Rooms', url: '/rooms' },
    { name: titles[room], url: `/rooms/${room}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, '\\u003c'),
        }}
      />
      <RoomPageClient room={room} image={image} products={products} />
    </>
  );
}
