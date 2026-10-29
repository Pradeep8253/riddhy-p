import { notFound } from "next/navigation";
import { getCanonicalUrl, getBreadcrumbSchema } from "@/lib/seo";
import styles from "./policy.module.css";

const policies = {
  shipping: {
    title: "Shipping & Delivery",
    intro:
      "We deliver across India with care, and keep you informed at every step — from dispatch to doorstep.",
    sections: [
      [
        "Delivery timelines",
        "Most in-stock furniture is delivered within 5–10 business days in serviceable metro cities, and 7–15 business days for other locations. Made-to-order and custom pieces may take 2–6 weeks depending on the product. Estimated delivery dates are shown on the product page and again at checkout before you pay.",
      ],
      [
        "Delivery charges",
        "Delivery is free on orders above ₹15,000. For orders below this amount, a flat delivery fee is calculated at checkout based on your pincode and the size/weight of the item. Bulky items such as sofas, wardrobes and dining sets may carry a separate logistics charge shown upfront — never added after order confirmation.",
      ],
      [
        "Installation & assembly",
        "Items that require assembly (beds, wardrobes, modular furniture, office desks) include free basic installation within city limits, carried out by our verified delivery partners. The product page clearly states whether an item arrives ready-to-use or requires assembly.",
      ],
      [
        "Tracking your order",
        "Once shipped, you'll receive an SMS and email with a tracking link. You can also check live order status anytime from 'My Orders' in your account.",
      ],
      [
        "Delivery day",
        "Our team will call you to confirm a convenient delivery slot. Please ensure someone is available to receive and inspect the item, and that the entry/lift/staircase can accommodate the product dimensions listed on the page.",
      ],
    ],
    notice:
      "Delivery timelines may vary during sale periods, extreme weather or in remote locations. We'll notify you of any delay beyond the committed window.",
  },

  returns: {
    title: "Returns & Refunds",
    intro:
      "We want you to love your furniture. If something isn't right, we make returns straightforward.",
    sections: [
      [
        "Return window",
        "Most products can be returned within 7 days of delivery if unused, uninstalled and in original packaging. Mattresses have a 100-night trial period. Custom-made and made-to-order furniture is non-returnable unless defective or damaged.",
      ],
      [
        "Damaged or defective items",
        "If your item arrives damaged or with a manufacturing defect, please contact us within 48 hours of delivery with photos/videos. We'll arrange a free replacement or repair — no questions asked. Do not discard the original packaging until the issue is resolved.",
      ],
      [
        "How to request a return",
        "Go to 'My Orders', select the item, and choose 'Return or Replace'. Our team will schedule a pickup and keep you updated throughout the process. For assembled furniture, our technician will disassemble it at the time of pickup.",
      ],
      [
        "Refund processing",
        "Once the returned item passes quality inspection, refunds are processed to your original payment method within 5–7 business days. For prepaid orders, refunds go back to the same card/UPI/bank account used for payment. COD orders are refunded via bank transfer.",
      ],
      [
        "Non-returnable items",
        "Custom-sized furniture, clearance/sale items marked 'final sale', and products with removed tags or missing original packaging cannot be returned unless defective.",
      ],
    ],
    notice:
      "Please inspect your furniture at the time of delivery. Approval of delivery does not waive your right to report a defect within the return window.",
  },

  refund: {
    title: "Returns & Refund Policy",
    intro:
      "We want you to love your furniture. If something isn't right, our refund and return process is straightforward and fast.",
    sections: [
      [
        "Return window",
        "Most products can be returned within 7 days of delivery if unused, uninstalled and in original packaging. Mattresses have a 100-night trial period. Custom-made and made-to-order furniture is non-returnable unless defective or damaged.",
      ],
      [
        "Refund processing & timelines",
        "Once the returned item passes quality inspection, refunds are processed to your original payment method within 5–7 business days. For prepaid orders (cards, UPI, net banking), refunds go back to the source account. COD orders are refunded via direct bank transfer.",
      ],
      [
        "Damaged or defective pieces",
        "If your item arrives damaged or with a manufacturing defect, contact us within 48 hours with photos or videos. We provide free replacement, repair, or full refund.",
      ],
    ],
    notice:
      "Please inspect your furniture at the time of delivery. Approval of delivery does not waive your right to report a defect within the return window.",
  },

  warranty: {
    title: "Warranty & Product Care",
    intro:
      "Every piece of furniture comes with a warranty against manufacturing defects — the details vary by product and material.",
    sections: [
      [
        "Standard warranty",
        "Solid wood furniture carries a 1-year warranty, upholstered furniture (sofas, chairs) carries a 1-year warranty on frame and foam, and mattresses carry warranties ranging from 5 to 10 years depending on the model. The exact warranty period is listed on each product page and your invoice.",
      ],
      [
        "What's covered",
        "The warranty covers manufacturing defects such as joint failures, hardware malfunction, foam sagging beyond specified limits, and fabric/leather peeling under normal use. It does not cover damage from misuse, accidents, pests, water exposure, or normal wear and tear like fading or minor scratches.",
      ],
      [
        "Warranty start date",
        "Coverage begins from the date of delivery (or installation, for items we assemble). You can view the exact start date and days remaining under 'My Account → Warranty' once your product is delivered.",
      ],
      [
        "Registering an offline purchase",
        "If you bought from one of our physical stores, sign in and register your product using the invoice number and serial number (if applicable) to activate warranty tracking and raise service requests online.",
      ],
      [
        "Raising a service request",
        "For any warranty issue, go to 'My Account → Warranty', select the product and describe the issue with photos. Our service partner will contact you within 2 business days to schedule an inspection or repair.",
      ],
      [
        "Furniture care tips",
        "Keep wooden furniture away from direct sunlight and moisture. Use coasters for hot/wet items on wooden surfaces. Vacuum upholstery regularly and avoid harsh chemical cleaners — use only the recommended fabric/leather care kit.",
      ],
    ],
    notice:
      "Warranty terms vary by product category and are also printed on the invoice provided at delivery. In case of any conflict, the terms on your invoice apply.",
  },

  privacy: {
    title: "Privacy Policy",
    intro:
      "We collect only what's needed to deliver your furniture and serve you better — and we protect it accordingly.",
    sections: [
      [
        "Information we collect",
        "Name, delivery address, phone number, email, and order history to process and deliver your orders. Payment information (card/UPI/net banking) is collected and processed directly by our payment partners — we never store your card details.",
      ],
      [
        "How we use your information",
        "To process orders, schedule delivery and installation, send order updates, manage warranty requests, provide customer support, and occasionally share offers if you've opted in. We do not sell your personal data to third parties.",
      ],
      [
        "Sharing with partners",
        "We share necessary delivery details (name, address, phone) with our logistics and installation partners solely to fulfil your order. These partners are contractually bound to use your data only for that purpose.",
      ],
      [
        "Cookies & guest carts",
        "We use cookies to keep you signed in and remember items in your cart. If you're browsing as a guest, your cart is stored locally on your device and is not linked to your identity until you check out.",
      ],
      [
        "Your rights",
        "You can request a copy of your data, ask us to correct inaccuracies, or request deletion of your account by writing to our support email. We retain order records as required by applicable tax and consumer protection laws.",
      ],
      [
        "Data security",
        "We use industry-standard encryption (SSL) for all transactions and restrict internal access to customer data on a need-to-know basis.",
      ],
    ],
    notice:
      "If you have questions about how your data is handled, reach out to our support team — we're happy to help.",
  },

  terms: {
    title: "Terms of Use",
    intro: "Please read these terms before using the Riddhy Furniture website.",
    sections: [
      [
        "Product information",
        "We try to keep product descriptions, dimensions, materials and prices accurate and up to date. Colours may vary slightly from screen to screen due to display settings. If a listed price is incorrect due to a technical error, we'll contact you before processing the order.",
      ],
      [
        "Orders & payment",
        "An order is confirmed only after successful payment or, for Cash on Delivery, after our team confirms serviceability for your address. Prices shown at checkout, inclusive of applicable taxes and delivery charges, are final at the time of order placement.",
      ],
      [
        "Pricing & offers",
        "Discounts and coupon codes are valid for limited periods and specific products as mentioned in the offer terms. We reserve the right to modify or withdraw an offer at any time without prior notice.",
      ],
      [
        "Your account",
        "You're responsible for keeping your account login details confidential. Please notify us immediately if you suspect unauthorised access to your account.",
      ],
      [
        "Limitation of liability",
        "While we take care in packaging and delivery, Riddhy Furniture's liability for any claim relating to a product is limited to repair, replacement or refund as per our returns and warranty policy.",
      ],
      [
        "Governing law",
        "These terms are governed by the laws of India. Any disputes will be subject to the jurisdiction of the courts located in Prayagraj, Uttar Pradesh.",
      ],
    ],
    notice:
      "We may update these terms from time to time. Continued use of the website after changes means you accept the updated terms.",
  },

  gst: {
    title: "GST & Invoicing",
    intro:
      "All our prices are GST-compliant, and you'll receive a proper tax invoice with every order.",
    sections: [
      [
        "GST on furniture",
        "Furniture products are taxed at the applicable GST rate as per government regulations (currently 12–18% depending on the category and material). The rate applicable to your product is shown in the price breakup at checkout.",
      ],
      [
        "Tax invoice",
        "A GST-compliant tax invoice is generated automatically for every order and is available for download from 'My Orders'. It includes our GSTIN, HSN/SAC code for the product, taxable value, and tax amount charged.",
      ],
      [
        "Business purchases",
        "If you're purchasing for your business and need the invoice under your company's GSTIN, please add your business details (name, GSTIN, billing address) at checkout before placing the order. GSTIN cannot be added after the invoice is generated.",
      ],
      [
        "Price display",
        "All prices displayed on product pages are inclusive of GST, unless stated otherwise for bulk or B2B orders.",
      ],
    ],
    notice:
      "For any invoice corrections or GST-related queries, please contact our support team within 24 hours of order confirmation.",
  },
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const policy = policies[slug];
  const title = policy?.title || "Policies";
  const description = policy?.intro || "Riddhy Furniture policies.";
  return {
    title: `${title} | Riddhy Furnitures Prayagraj`,
    description,
    alternates: {
      canonical: getCanonicalUrl(`/policies/${slug}`),
    },
    openGraph: {
      title: `${title} | Riddhy Furnitures Prayagraj`,
      description,
      url: getCanonicalUrl(`/policies/${slug}`),
    },
  };
}

export default async function PolicyPage({ params }) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();

  const breadcrumbs = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Policies", url: `/policies/${slug}` },
    { name: policy.title, url: `/policies/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbs).replace(/</g, "\\u003c"),
        }}
      />
      <article className={`container ${styles.page}`}>
        <span className="kicker">Riddhy Furniture · Policy Information</span>
        <h1>{policy.title}</h1>
        <p className={styles.intro}>{policy.intro}</p>
        <div className={styles.sections}>
          {policy.sections.map(([title, body]) => (
            <section key={title}>
              <h2>{title}</h2>
              <p>{body}</p>
            </section>
          ))}
        </div>
        <aside>{policy.notice}</aside>
        <small className={styles.updated}>
          Last updated: policies are reviewed periodically to stay current.
        </small>
      </article>
    </>
  );
}
