import { notFound } from "next/navigation";
import styles from "./policy.module.css";
const policies = {
  shipping: {
    title: "Shipping & delivery",
    intro:
      "Clear dates, careful delivery and installation options shown before payment.",
    sections: [
      [
        "Delivery availability",
        "Delivery eligibility is checked by pincode and by item. The live system should display a confirmed delivery window before payment. The current project uses a sample serviceability map only.",
      ],
      [
        "Charges and scheduling",
        "Applicable delivery and installation charges are calculated in the server-side checkout quote. Sample rates in this demo are not a final commercial policy.",
      ],
      [
        "Installation",
        "Some appliances or furniture require professional installation. The product page and checkout should show whether installation is available for your product and location.",
      ],
      [
        "Before launch",
        "Replace demo pincode rules, fee assumptions, delivery estimates and support details with your verified fulfilment policy.",
      ],
    ],
    notice: "Example policy copy. Confirm all operational terms before launch.",
  },
  returns: {
    title: "Returns & refunds",
    intro: "A clear path to raise an issue and understand next steps.",
    sections: [
      [
        "Requesting help",
        "Contact support with your order number and a brief description of the issue. Photograph any visible transit damage before disposing of packaging.",
      ],
      [
        "Eligibility and timelines",
        "Return eligibility depends on product condition, category, installation status and applicable consumer law. Configure and publish the approved rules for your business here.",
      ],
      [
        "Refunds",
        "Refunds are initiated only after the return or cancellation is accepted and the payment provider confirms the refund. A browser redirect is not evidence of a refund.",
      ],
      [
        "Demo notice",
        "This page is a template, not a final returns promise. Set category-specific rules and service workflows before enabling production checkout.",
      ],
    ],
    notice:
      "Example policy copy. Confirm legal and operational terms before launch.",
  },
  warranty: {
    title: "Warranty & product care",
    intro:
      "Manufacturer, seller and optional extended cover should be easy to distinguish.",
    sections: [
      [
        "What is covered",
        "Coverage depends on the exact product, manufacturer policy and any seller or extended protection purchased. The product page keeps those parts separate.",
      ],
      [
        "When cover starts",
        "The policy defines whether coverage begins on delivery or installation. It does not start on the order date. The customer dashboard calculates remaining days from the stored expiry date using Asia/Kolkata dates.",
      ],
      [
        "Register a product",
        "Sign in to register an eligible product. For an offline purchase, include the serial number and actual delivery/installation date. Supporting documents and service claims belong to your account.",
      ],
      [
        "Final terms",
        "The example catalogue includes sample terms only. Always refer to the policy supplied with the specific product and invoice.",
      ],
    ],
    notice:
      "Illustrative policy. Replace durations and coverage terms with approved manufacturer and seller policies.",
  },
  privacy: {
    title: "Privacy",
    intro:
      "Use customer data only to fulfil orders, support customers and meet legal obligations.",
    sections: [
      [
        "Data we collect",
        "Account, address, order, payment-reference and support information needed for the stated service. Payment card credentials are handled by the payment provider.",
      ],
      [
        "How it is used",
        "To process an order, coordinate delivery and installation, manage warranty or service requests, prevent abuse and respond to enquiries.",
      ],
      [
        "Retention and security",
        "Define retention periods, access controls, processor agreements and customer rights before launch. Never place secrets or payment credentials in browser storage.",
      ],
      [
        "Demo notice",
        "This project stores guest cart preferences locally. A production privacy notice must reflect actual analytics, cookies, providers and retention.",
      ],
    ],
    notice:
      "Template notice only. Obtain legal review for your business and jurisdictions.",
  },
  terms: {
    title: "Terms of use",
    intro: "A practical framework for using the Riddhy store.",
    sections: [
      [
        "Catalogue information",
        "Product specifications, dimensions, prices, taxes and availability must be confirmed against the live SKU before an order is accepted.",
      ],
      [
        "Orders and payment",
        "The server calculates final amounts. Orders are not marked paid from a redirect alone; payment signatures and provider events are verified.",
      ],
      [
        "Accounts",
        "Keep account credentials private. Role-based access protects customer and operations features.",
      ],
      [
        "Demo notice",
        "Replace this template with reviewed terms, governing law, grievance officer information and business identity before launch.",
      ],
    ],
    notice: "Template terms only. Obtain legal review before launch.",
  },
  gst: {
    title: "GST information",
    intro:
      "Tax invoices must match your legal entity and product tax classifications.",
    sections: [
      [
        "GST and invoices",
        "The project stores a GST class per product and builds a print-friendly invoice view. Verify HSN/SAC codes, tax inclusion rules, place of supply, GSTIN and invoice sequence with your tax adviser.",
      ],
      [
        "Current build",
        "The demo quote shows estimated tax separately for clarity. Actual Indian retail display and invoicing should follow the seller’s tax configuration.",
      ],
      [
        "Before launch",
        "Set your legal business name, GSTIN, HSN mapping, place-of-supply rules and invoice format before taking payments.",
      ],
    ],
    notice:
      "Illustrative only. Confirm tax treatment with a qualified tax professional.",
  },
};
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: policies[slug]?.title || "Policies",
    description: policies[slug]?.intro || "RF Riddhy policies.",
  };
}
export default async function PolicyPage({ params }) {
  const { slug } = await params;
  const policy = policies[slug];
  if (!policy) notFound();
  return (
    <article className={`container ${styles.page}`}>
      <span className="kicker">RF Riddhy · policy information</span>
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
        Demo policy page · review and update before launch.
      </small>
    </article>
  );
}
