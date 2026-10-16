export const CONSULTATION_FAQS = [
  {
    q: 'Is the home consultation really free?',
    qHi: 'क्या होम परामर्श वास्तव में मुफ़्त है?',
    a: 'Yes, absolutely. The consultation session is 100% free with zero obligation to purchase. Our goal is to help you understand room layouts, dimensions, appliance capacity, and delivery readiness.',
    aHi: 'हाँ, बिल्कुल। परामर्श पूरी तरह से मुफ़्त है और खरीदारी की कोई बाध्यता नहीं है। हमारा उद्देश्य आपको कमरे की व्यवस्था और सही माप समझने में मदद करना है।'
  },
  {
    q: 'How long does a consultation session usually take?',
    qHi: 'परामर्श सत्र में आमतौर पर कितना समय लगता है?',
    a: 'A typical phone or video session takes 20 to 30 minutes. If you visit our experience store or request an in-person space check, plan for 45 to 60 minutes.',
    aHi: 'फ़ोन या वीडियो सत्र में आमतौर पर 20 से 30 मिनट लगते हैं। शोरूम विज़िट के लिए 45 से 60 मिनट का समय रखें।'
  },
  {
    q: 'Can I reschedule or cancel my slot later?',
    qHi: 'क्या मैं बाद में समय बदल सकता/सकती हूँ?',
    a: 'Yes. Simply reply to your booking confirmation or message us on WhatsApp with your reference number (RC-YYMMDD-XXXX) and your updated preferred slot.',
    aHi: 'हाँ। आप अपने संदर्भ नंबर (RC-YYMMDD-XXXX) के साथ हमारे व्हाट्सएप पर संदेश भेजकर आसानी से नया समय चुन सकते हैं।'
  },
  {
    q: 'What if my pincode is outside your current delivery area?',
    qHi: 'यदि मेरा पिनकोड आपके डिलीवरी क्षेत्र में नहीं है तो क्या होगा?',
    a: 'You can still request a consultation. Our design advisors will assist with planning and check if special regional delivery or freight dispatch is feasible for your order.',
    aHi: 'आप तब भी परामर्श ले सकते हैं। हमारे विशेषज्ञ योजना में मदद करेंगे और क्षेत्रीय डिलीवरी की संभावनाओं की जांच करेंगे।'
  },
  {
    q: 'What should I keep ready before the session?',
    qHi: 'सत्र से पहले मुझे क्या तैयार रखना चाहिए?',
    a: 'Rough measurements of your room, photos or a short video of the space, doorway/staircase clearances for large items, and approximate budget preferences.',
    aHi: 'कमरे के मोटे माप, कमरे की तस्वीरें, दरवाज़ों और सीढ़ियों का स्थान और अपना अनुमानित बजट।'
  },
  {
    q: 'Will I get a written estimate and product shortlist?',
    qHi: 'क्या मुझे लिखित अनुमान और उत्पादों की सूची मिलेगी?',
    a: 'Yes. Following the consultation, your advisor will share a personalized shortlist with dimensions, finish options, energy ratings, and delivery timelines.',
    aHi: 'हाँ। परामर्श के बाद, आपके सलाहकार आपको माप, विकल्प और डिलीवरी समय के साथ व्यक्तिगत सूची साझा करेंगे।'
  },
  {
    q: 'Do you help with appliance electrical & plumbing feasibility?',
    qHi: 'क्या आप उपकरणों की बिजली और प्लमबिंग की जांच में मदद करते हैं?',
    a: 'Yes. We will verify socket amp ratings (16A vs 6A), drain hose positioning, inlet water pressure requirements, and ventilation clearances before you order.',
    aHi: 'हाँ। हम ऑर्डर से पहले सॉकेट क्षमता, पानी के इनलेट और वेंटिलेशन की आवश्यक जानकारी साझा करते हैं।'
  }
];

export function getConsultationFaqSchema(locale = 'en') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: CONSULTATION_FAQS.map((item) => ({
      '@type': 'Question',
      name: locale === 'hi' ? item.qHi : item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: locale === 'hi' ? item.aHi : item.a
      }
    }))
  };
}
