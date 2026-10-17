import Link from 'next/link';
import Image from 'next/image';
import ConsultationForm from '@/components/commerce/ConsultationForm';
import ConsultationFaq from '@/components/store/ConsultationFaq';
import { getConsultationFaqSchema } from '@/lib/consultation-faq-data';
import Icon from '@/components/ui/Icon';
import { siteConfig, isConfigured, getWhatsAppUrl } from '@/lib/site-config';
import { IMG } from '@/lib/images';
import styles from './consultation.module.css';

export async function generateMetadata() {
  const url = `${siteConfig.siteUrl}/consultation`;
  const title = 'Free Home Consultation — Furniture & Appliance Planning | RF Riddhy';
  const description =
    'Book a free, guided session with the Riddhy team for room-fit planning, appliance sizing, and installation walkthrough with zero purchase obligation.';

  return {
    title,
    description,
    alternates: {
      canonical: url
    },
    openGraph: {
      type: 'website',
      url,
      title,
      description,
      images: [IMG.og || '/og-image.webp']
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [IMG.og || '/og-image.webp']
    }
  };
}

export default async function ConsultationPage({ searchParams }) {
  const params = await searchParams;
  const initialProduct = params?.product || '';
  const initialInterest = params?.interest || '';
  const initialMode = params?.mode || '';

  const whatsappAvailable = isConfigured(siteConfig.contact.whatsapp);
  const whatsappUrl = getWhatsAppUrl('Hello! I would like to enquire about booking a home consultation with RF Riddhy.');

  // JSON-LD Structured Data
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'RF Riddhy Free Home Consultation',
    serviceType: 'Home Interior and Appliance Planning',
    provider: {
      '@type': 'Organization',
      name: siteConfig.brandName,
      url: siteConfig.siteUrl
    },
    areaServed: {
      '@type': 'Country',
      name: 'India'
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'INR'
    },
    description:
      'Complimentary consultation covering room dimensions, furniture layouts, appliance capacity, and delivery readiness.'
  };

  const faqSchema = getConsultationFaqSchema('en');

  return (
    <>
      {/* Server JSON-LD schemas */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, '\\u003c') }}
      />

      <main className={styles.main}>
        {/* 1. HERO */}
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <span className="kicker">Personalised home advice · 100% Free</span>
                <h1 className={styles.heroTitle}>
                  Rooms that fit.<br />
                  <em>Appliances that flow.</em>
                </h1>
                <p className={styles.heroSubtitle}>
                  Planning a single room or outfitting a whole home? Book a free, guided session with our
                  advisors to evaluate dimensions, appliance capacities, electrical fit, and delivery access before you order.
                </p>

                <div className={styles.heroCtas}>
                  <a href="#consultation-form" className={styles.primaryCta}>
                    Book my consultation <Icon name="arrow" size={17} />
                  </a>

                  {whatsappAvailable && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappCta}
                    >
                      <Icon name="whatsapp" size={18} />
                      WhatsApp us
                    </a>
                  )}
                </div>

                <div className={styles.heroBadges}>
                  <div>
                    <Icon name="check" size={16} />
                    <span>No purchase pressure</span>
                  </div>
                  <div>
                    <Icon name="check" size={16} />
                    <span>20–30 min guided session</span>
                  </div>
                  <div>
                    <Icon name="check" size={16} />
                    <span>Free written shortlist</span>
                  </div>
                </div>
              </div>

              <div className={styles.heroImageCol}>
                <div className={styles.heroImageWrapper}>
                  <Image
                    src={IMG.rooms[0]?.src || '/images/room-living.webp'}
                    alt="Warm, curated living space arranged by RF Riddhy"
                    width={560}
                    height={420}
                    className={styles.heroImage}
                    priority
                  />
                  <div className={styles.heroImageCard}>
                    <span className={styles.heroCardBadge}>Guided Layout</span>
                    <strong>Room Fit & Clearance Plan</strong>
                    <small>Tailored to your space & requirements</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. WHAT YOU GET */}
        <section className={`section ${styles.whatYouGet}`}>
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="kicker">Session highlights</span>
              <h2>Four things we solve together.</h2>
              <p className="muted">
                Avoid costly sizing mistakes and unexpected electrical or doorway surprises.
              </p>
            </div>

            <div className={styles.cardGrid4}>
              <article className={styles.benefitCard}>
                <span className={styles.cardNum}>01</span>
                <h3>Room-fit planning</h3>
                <p>
                  Clearance paths, seating proportions, and spatial circulation. We make sure the coffee table leaves room for the sofa recliner.
                </p>
              </article>

              <article className={styles.benefitCard}>
                <span className={styles.cardNum}>02</span>
                <h3>Appliance sizing advice</h3>
                <p>
                  16A vs 6A sockets, inlet water pressure, refrigerator door swing angles, and washing machine drain heights verified.
                </p>
              </article>

              <article className={styles.benefitCard}>
                <span className={styles.cardNum}>03</span>
                <h3>Budget-smart shortlist</h3>
                <p>
                  Curated options matching your aesthetic and budget. Honest trade-offs between finishes, warranties, and energy star ratings.
                </p>
              </article>

              <article className={styles.benefitCard}>
                <span className={styles.cardNum}>04</span>
                <h3>Delivery walkthrough</h3>
                <p>
                  Lift dimensions, stair turns, and doorstep clearances checked beforehand so delivery day is completely calm.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS TIMELINE */}
        <section className={`section ${styles.howItWorks}`}>
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="kicker">Simple 4-step journey</span>
              <h2>How your consultation works.</h2>
            </div>

            <div className={styles.timelineGrid}>
              {[
                {
                  step: '1',
                  title: 'Share your space',
                  desc: 'Pick your room type, budget preference, and rough dimensions in the form below.'
                },
                {
                  step: '2',
                  title: 'Pick your slot',
                  desc: 'Choose whether you prefer a phone call, video share, or showroom visit with your ideal time.'
                },
                {
                  step: '3',
                  title: 'Talk with an expert',
                  desc: 'A dedicated Riddhy advisor reviews your space and walks through suitable pieces.'
                },
                {
                  step: '4',
                  title: 'Get your written plan',
                  desc: 'Receive an itemised shortlist with verified dimensions, energy ratings, and delivery dates.'
                }
              ].map((item) => (
                <div key={item.step} className={styles.timelineItem}>
                  <div className={styles.timelineMarker}>{item.step}</div>
                  <h4>{item.title}</h4>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. CONSULTATION BOOKING FORM */}
        <section id="consultation-form" className={`section ${styles.formSection}`}>
          <div className="container">
            <div className={styles.formIntro}>
              <span className="kicker">Reserve your slot</span>
              <h2>Book your consultation.</h2>
              <p className="muted">
                Fill in the details below. Our team prepares for your session before reaching out.
              </p>
            </div>

            <ConsultationForm
              initialProductSlug={initialProduct}
              initialInterest={initialInterest}
            />
          </div>
        </section>

        {/* 5. WHAT TO KEEP READY */}
        <section className={`section ${styles.prepSection}`}>
          <div className="container">
            <div className={styles.prepCard}>
              <div className={styles.prepHead}>
                <span className="kicker">Helpful preparation</span>
                <h3>What to keep handy for your session</h3>
                <p>You don’t need architectural drawings. A few practical details make the session 10x more useful.</p>
              </div>

              <div className={styles.prepGrid}>
                <div className={styles.prepItem}>
                  <Icon name="check" size={20} className={styles.prepIcon} />
                  <div>
                    <b>Room photos or a 360° video</b>
                    <small>Snap from corners so we can see light sources, doorways, and existing furniture.</small>
                  </div>
                </div>

                <div className={styles.prepItem}>
                  <Icon name="check" size={20} className={styles.prepIcon} />
                  <div>
                    <b>Rough wall lengths & ceiling height</b>
                    <small>A tape measure check of the main wall helps verify sofa and wardrobe scale.</small>
                  </div>
                </div>

                <div className={styles.prepItem}>
                  <Icon name="check" size={20} className={styles.prepIcon} />
                  <div>
                    <b>Power & water connection points</b>
                    <small>For washing machines, dishwashers, and refrigerators, note where the tap and 16A socket sit.</small>
                  </div>
                </div>

                <div className={styles.prepItem}>
                  <Icon name="check" size={20} className={styles.prepIcon} />
                  <div>
                    <b>Entryway & lift clearances</b>
                    <small>For large 3-seater sofas or double-door fridges, check lift height and staircase turns.</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 6. TRUST & WARRANTY STRIP */}
        <section className={styles.trustStrip}>
          <div className="container">
            <div className={styles.trustGrid}>
              <div>
                <span className={styles.trustLabel}>THE RIDDHY STANDARD</span>
                <h3>Thoughtful curation. Zero fine-print surprises.</h3>
              </div>
              <p>
                We believe furniture and appliances deserve clarity. That means manufacturer warranties
                separated clearly from seller coverage, verified delivery windows, and dedicated support long after installation.
              </p>
              <Link href="/about" className={styles.trustLink}>
                Learn more about RF Riddhy <Icon name="arrow" size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* 7. FAQ ACCORDION */}
        <section className={`section ${styles.faqSection}`}>
          <div className="container">
            <div className={styles.sectionHead}>
              <span className="kicker">Common questions</span>
              <h2>Frequently asked questions.</h2>
              <p className="muted">
                Everything you need to know about our home consultation service.
              </p>
            </div>

            <ConsultationFaq />
          </div>
        </section>

        {/* 8. FINAL CTA BAND */}
        <section className={styles.endBanner}>
          <div className="container">
            <div className={styles.endContent}>
              <span className="kicker" style={{ color: 'var(--rf-gold-400)' }}>Ready to begin?</span>
              <h2>Make your home feel considered.</h2>
              <p>Schedule your free 20-minute session today.</p>
              <a href="#consultation-form" className={styles.endBtn}>
                Book Free Consultation
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
