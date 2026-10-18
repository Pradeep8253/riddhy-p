"use client";

import BulkEnquiryForm from "./BulkEnquiryForm";
import ContactForm from "./ContactForm";

export { BulkEnquiryForm, ContactForm };

export default function InquiryForm({
  kind = "contact",
  initialTopic = "general",
  ...props
}) {
  if (kind === "bulk") {
    return <BulkEnquiryForm {...props} />;
  }

  return <ContactForm initialTopic={initialTopic} {...props} />;
}
