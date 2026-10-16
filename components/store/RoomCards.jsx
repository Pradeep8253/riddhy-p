import Image from 'next/image';
import Link from 'next/link';
import { IMG } from '@/lib/images';
import Icon from '@/components/ui/Icon';
import styles from './RoomCards.module.css';
export default function RoomCards(){return <div className={styles.grid}>{IMG.rooms.map((room,index)=><Link key={room.slug} href={`/rooms/${room.slug}`} className={`${styles.card} ${index===0?styles.large:''}`}><Image src={room.src} alt={room.alt} fill sizes="(max-width: 720px) 80vw, (max-width: 1100px) 40vw, 25vw" placeholder="blur" blurDataURL={IMG.blurDataURL} unoptimized/><span className={styles.number}>0{index+1}</span><div className={styles.label}><b>{room.name}</b><span>Explore room <Icon name="arrow" size={16}/></span></div></Link>)}</div>}
