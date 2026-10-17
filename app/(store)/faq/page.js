import styles from './faq.module.css';

export const metadata = {
  title: 'Frequently asked questions',
  description: 'Answers about product dimensions, delivery, installation, payments, returns and warranty at RF Riddhy.'
};

const faq = [
  [
    'How do I choose furniture that fits?',
    'Start with the listed width, depth and height, then check doorways, stairs and lift access. Product pages include package dimensions and a doorway-clearance reminder.'
  ],
  [
    'Can I check delivery before ordering?',
    'Yes. Enter your six-digit pincode on the product page or in checkout to see instant delivery feasibility and turnaround times.'
  ],
  [
    'Is installation included?',
    'Eligible installation options, technician scheduling and charges are clearly displayed before payment based on the specific product and pincode.'
  ],
  [
    'When does warranty begin?',
    'The start rule is configured by policy—typically on successful delivery or installation—not the order date. The product page shows manufacturer and seller cover clearly.'
  ],
  [
    'Can I pay cash on delivery?',
    'Cash on delivery is available for eligible delivery pincodes on orders under specified value thresholds.'
  ],
  [
    'Are product images representative of actual products?',
    'Yes. All photographs showcase authentic dimensions, natural wood grains, and fabric finishes of RF Riddhy furniture and certified appliances.'
  ],
  [
    'How are refunds handled?',
    'Refund requests are processed quickly by our dedicated team back to your original payment method.'
  ]
];

export default function FaqPage() {
  return (
    <section className={`container ${styles.page}`}>
      <span className="kicker">Helpful answers, without the hunt</span>
      <h1>
        Frequently asked<br />
        <em>questions.</em>
      </h1>
      <p className={styles.lead}>
        A few details about choosing, ordering and caring for the things that make a home.
      </p>
      <div className={styles.list}>
        {faq.map(([question, answer], index) => (
          <details key={question} open={index === 0}>
            <summary>
              <span>{question}</span>
              <i>+</i>
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
