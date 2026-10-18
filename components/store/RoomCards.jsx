'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { IMG } from '@/lib/images';
import Icon from '@/components/ui/Icon';
import styles from './RoomCards.module.css';

const roomNamesHi = {
  living: 'लिविंग रूम',
  bedroom: 'बेडरूम',
  dining: 'डाइनिंग रूम',
  study: 'स्टडी रूम',
  kitchen: 'किचन एवं यूटिलिटी'
};

export default function RoomCards() {
  const locale = useSelector((state) => state.ui?.locale || 'en');

  return (
    <div className={styles.grid}>
      {IMG.rooms.map((room, index) => {
        const name = locale === 'hi' && roomNamesHi[room.slug] ? roomNamesHi[room.slug] : room.name;
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
              placeholder="blur"
              blurDataURL={IMG.blurDataURL}
              unoptimized
            />
            <span className={styles.number}>0{index + 1}</span>
            <div className={styles.label}>
              <b>{name}</b>
              <span>
                {locale === 'hi' ? 'कमरा देखें' : 'Explore room'} <Icon name="arrow" size={16} />
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
