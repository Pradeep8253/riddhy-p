'use client';

import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import styles from './RoomCards.module.css';

const ROOMS = [
  {
    name: "Living Room",
    slug: "living",
    src: "/images/room-living.webp?v=20261023",
    alt: "Sage and cream living room with a sofa and floor lamp",
  },
  {
    name: "Bedroom",
    slug: "bedroom",
    src: "/images/room-bedroom.webp",
    alt: "Calm bedroom with a low wooden bed and soft linens",
  },
  {
    name: "Dining",
    slug: "dining",
    src: "/images/room-dining.webp",
    alt: "Warm dining room with a solid wood table",
  },
  {
    name: "Study",
    slug: "study",
    src: "/images/room-study.webp",
    alt: "Bright home study with a desk and task chair",
  },
  {
    name: "Kitchen & Utility",
    slug: "kitchen",
    src: "/images/room-kitchen.webp",
    alt: "Clean kitchen utility corner with helpful appliances",
  },
];

export default function RoomCards() {
  return (
    <div className={styles.grid}>
      {ROOMS.map((room, index) => {
        return (
          <Link
            key={room.slug}
            href={`/rooms/${room.slug}`}
            className={`${styles.card} ${index === 0 ? styles.large : ''}`}
          >
            <Image
              src={room.src}
              alt={room.alt}
              fill
              sizes="(max-width: 720px) 80vw, (max-width: 1100px) 40vw, 25vw"
              unoptimized
            />
            <span className={styles.number}>0{index + 1}</span>
            <div className={styles.label}>
              <b>{room.name}</b>
              <span>
                Explore room <Icon name="arrow" size={16} />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
