import { notFound } from 'next/navigation';
import { getDemoProducts } from '@/lib/demo-data';
import { IMG } from '@/lib/images';
import RoomPageClient from '@/components/store/RoomPageClient';

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

  return <RoomPageClient room={room} image={image} products={products} />;
}
