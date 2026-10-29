import styles from './faq.module.css';
import { getCanonicalUrl, getBreadcrumbSchema, getFaqSchema } from '@/lib/seo';

export const metadata = {
  title: 'Frequently Asked Questions | Furniture & Appliances in Prayagraj | RF Riddhy',
  description:
    'Answers about furniture showroom location in Prayagraj & Mansoorabad, delivery areas, wedding packages, warranty, returns, and payment options at Riddhy Furnitures.',
  keywords: [
    'furniture shop in Prayagraj FAQ',
    'Riddhy Furnitures Mansoorabad address',
    'furniture delivery Prayagraj',
    'wedding furniture package Prayagraj',
    'RF Riddhy customer care',
  ],
  alternates: {
    canonical: getCanonicalUrl('/faq'),
  },
  openGraph: {
    title: 'FAQ — Riddhy Furnitures & Home Appliances Prayagraj',
    description:
      'Answers to common questions about furniture, appliances, wedding packages, and delivery in Prayagraj.',
    url: getCanonicalUrl('/faq'),
    images: ['/images/og-image.webp'],
  },
};

const faqData = [
  {
    question: 'Where can I buy furniture and home appliances in Prayagraj?',
    answer:
      'You can purchase directly online at riddhyfurnitures.in or visit the physical showroom at Mansoorabad, Prayagraj, Uttar Pradesh 229411 (Near GT Road). The showroom features solid wood double beds, sofa sets, almirahs, dining sets, home appliances, and kitchen utensils.',
  },
  {
    question: 'Where is the Riddhy Furnitures showroom located?',
    answer:
      'The Riddhy Furnitures showroom is located in Mansoorabad, Prayagraj, Uttar Pradesh 229411, India. The store is open 7 days a week from 10:00 AM to 8:30 PM. Customers can contact the team at +91 88402 45188 or via WhatsApp.',
  },
  {
    question: 'Which furniture and appliance categories are available at Riddhy Furnitures?',
    answer:
      'Riddhy Furnitures offers 3 core departments: 1) Furniture: Solid wood double beds, hydraulic storage beds, luxury sofa sets, dressing tables (shringardan), steel and wooden almirahs, dining tables, mattresses, and plastic chairs. 2) Home Appliances: Refrigerators, washing machines, desert coolers, LED TVs, kitchen chimneys, and mixer grinders. 3) Kitchenware: Heavy-gauge stainless steel dinner sets, pressure cookers, and cookware.',
  },
  {
    question: 'Does Riddhy Furnitures provide doorstep delivery and installation in Prayagraj?',
    answer:
      'Yes. Riddhy Furnitures provides doorstep delivery across Prayagraj, Mansoorabad, Phulpur, Handia, Jhusi, Naini, Civil Lines, Kaushambi, and nearby areas in Uttar Pradesh. Furniture pieces that require assembly include professional white-glove installation.',
  },
  {
    question: 'Are wedding furniture and appliance packages available?',
    answer:
      'Yes. Riddhy Furnitures offers 5 comprehensive wedding packages: Shagun, Lagan, Kanyadaan, Griha Lakshmi, and Bhagya Shree from ₹49,999 to ₹89,999. These packages combine bedroom furniture, almirah, sofa, cooler, refrigerator, and 40+ utensil pieces in one value bundle.',
  },
  {
    question: 'How do I choose furniture dimensions that fit my room?',
    answer:
      'Check the listed width, depth, and height on each product page, and measure doorways, stairs, and lift access before ordering. Every product page on Riddhy Furnitures displays package dimensions and doorway clearance reminders.',
  },
  {
    question: 'What warranty is offered on furniture and appliances?',
    answer:
      'Solid wood furniture frames come with up to 10 years of structural warranty against manufacturing defects. Mattresses carry 5 to 10-year warranties. All branded home appliances include manufacturer warranty with authorized service center support.',
  },
  {
    question: 'What payment options are accepted?',
    answer:
      'Riddhy Furnitures accepts Cash on Delivery (COD) for eligible pincodes, UPI, Debit and Credit Cards, Net Banking, and convenient No-Cost EMI options.',
  },
  {
    question: 'How are returns and refunds handled?',
    answer:
      'Items with transit damage or manufacturing defects reported within 48 hours receive free replacement, repair, or full refund. Refunds for prepaid orders are credited back to the original payment method within 5–7 business days.',
  },
];

export default function FaqPage() {
  const faqSchema = getFaqSchema(faqData);
  const breadcrumbs = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'FAQ', url: '/faq' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([faqSchema, breadcrumbs]).replace(/</g, '\\u003c'),
        }}
      />
      <section className={`container ${styles.page}`}>
        <span className="kicker">Helpful answers, without the hunt</span>
        <h1>
          Frequently asked
          <br />
          <em>questions.</em>
        </h1>
        <p className={styles.lead}>
          Everything you need to know about choosing furniture, showroom visits, delivery in Prayagraj, wedding packages, and aftercare.
        </p>
        <div className={styles.list}>
          {faqData.map((item, index) => (
            <details key={item.question} open={index === 0}>
              <summary>
                <span>{item.question}</span>
                <i>+</i>
              </summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
