import ListingHeader from "@/components/store/ListingHeader";
import CatalogShell from "@/components/store/CatalogShell";
import { getProducts } from "@/lib/catalogue";
export const metadata = {
  title: "Home Appliances",
  description:
    "Shop dependable refrigerators, washers, air conditioners, televisions and more with delivery and installation details.",
};
export default async function AppliancesPage() {
  const { items, total } = await getProducts({ type: "appliance", limit: 48 });
  return (
    <>
      <ListingHeader
        eyebrow="Appliance precision studio"
        title="Power the everyday."
        description="Compare capacity, energy ratings, dimensions and service options with clear, reassuring detail."
        count={total}
      />
      <CatalogShell
        products={items}
        title="Home appliance collection"
        description="Find the right fit for your space and routine."
      />
    </>
  );
}
