import { notFound } from 'next/navigation';
import { getCatalogue } from '@/lib/catalogue';
import RoomPageClient from '@/components/store/RoomPageClient';

const titles = {
  living: 'Living room',
  bedroom: 'Bedroom',
  dining: 'Dining room',
  study: 'Study & work',
  kitchen: 'Kitchen & utility'
};

const roomImages = {
  living: { name: 'Living Room', slug: 'living', src: '/images/room-living.webp?v=20261023', alt: 'Sage and cream living room with a sofa and floor lamp' },
  bedroom: { name: 'Bedroom', slug: 'bedroom', src: '/images/room-bedroom.webp', alt: 'Calm bedroom with a low wooden bed and soft linens' },
  dining: { name: 'Dining', slug: 'dining', src: '/images/room-dining.webp', alt: 'Warm dining room with a solid wood table' },
  study: { name: 'Study', slug: 'study', src: '/images/room-study.webp', alt: 'Bright home study with a desk and task chair' },
  kitchen: { name: 'Kitchen & Utility', slug: 'kitchen', src: '/images/room-kitchen.webp', alt: 'Clean kitchen utility corner with helpful appliances' }
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
  const image = roomImages[room] || roomImages.living;
  const allProducts = await getCatalogue();
  const products = allProducts.filter((item) => item.room === room).slice(0, 24);

  return <RoomPageClient room={room} image={image} products={products} />;
}
