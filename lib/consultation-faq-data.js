export const CONSULTATION_FAQS = [
  {
    q: 'Is the home consultation really free?',
    a: 'Yes, absolutely. The consultation session is 100% free with zero obligation to purchase. Our goal is to help you understand room layouts, dimensions, appliance capacity, and delivery readiness.'
  },
  {
    q: 'How long does a consultation session usually take?',
    a: 'A typical phone or video session takes 20 to 30 minutes. If you visit our experience store or request an in-person space check, plan for 45 to 60 minutes.'
  },
  {
    q: 'Can I reschedule or cancel my slot later?',
    a: 'Yes. Simply reply to your booking confirmation or message us on WhatsApp with your reference number (RC-YYMMDD-XXXX) and your updated preferred slot.'
  },
  {
    q: 'What if my pincode is outside your current delivery area?',
    a: 'You can still request a consultation. Our design advisors will assist with planning and check if special regional delivery or freight dispatch is feasible for your order.'
  },
  {
    q: 'What should I keep ready before the session?',
    a: 'Rough measurements of your room, photos or a short video of the space, doorway/staircase clearances for large items, and approximate budget preferences.'
  },
  {
    q: 'Will I get a written estimate and product shortlist?',
    a: 'Yes. Following the consultation, your advisor will share a personalized shortlist with dimensions, finish options, energy ratings, and delivery timelines.'
  },
  {
    q: 'Do you help with appliance electrical & plumbing feasibility?',
    a: 'Yes. We will verify socket amp ratings (16A vs 6A), drain hose positioning, inlet water pressure requirements, and ventilation clearances before you order.'
  }
];

export function getConsultationFaqSchema(locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CONSULTATION_FAQS.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a
      }
    }))
  };
}
