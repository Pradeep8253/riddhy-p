import Link from 'next/link';
import Button from '@/components/ui/Button';
import SectionHeading from '@/components/ui/SectionHeading';
import ApplianceGrid from './ApplianceGrid';
import styles from './ShopByAppliance.module.css';
export default function ShopByAppliance(){return <section className={styles.section}><div className="container"><SectionHeading eyebrow="Appliance precision studio" title="Good decisions start with clear details." description="Compare the things that matter—capacity, energy use, dimensions and installation—without losing the warmth of home." action={<Button href="/appliances" variant="outline">View all appliances <span>↗</span></Button>}/><ApplianceGrid/><div className={styles.note}><span>Every product page puts dimensions and service options upfront.</span><Link href="/policies/warranty">Understand cover <span>→</span></Link></div></div></section>}
