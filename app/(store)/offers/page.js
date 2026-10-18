import OffersClient from "@/components/store/OffersClient";

export const metadata = {
  title: "Offers & seasonal deals",
  description:
    "Browse scheduled campaigns and currently available offers at RF Riddhy. Terms and end dates are shown clearly.",
};

export default function OffersPage() {
  return <OffersClient />;
}
