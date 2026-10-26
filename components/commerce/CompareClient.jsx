"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { removeCompareItem, clearCompare } from "@/store/compareSlice";
import { addItem } from "@/store/cartSlice";
import { showToast } from "@/store/uiSlice";
import { formatINR } from "@/lib/pricing";
import { getLocalizedCategoryName } from "@/lib/translate-backend";
import ProductGrid from "@/components/ui/ProductGrid";
import Button from "@/components/ui/Button";
import styles from "./CompareClient.module.css";

const fieldDefs = [
  { label: "Price", key: "price" },
  { label: "Category", key: "categoryLabel", isCategory: true },
  { label: "Brand", key: "brand" },
  { label: "Width", key: "dimensions.width", unit: "cm" },
  { label: "Depth", key: "dimensions.depth", unit: "cm" },
  { label: "Height", key: "dimensions.height", unit: "cm" },
  { label: "Material", key: "specs.material" },
  { label: "Capacity", key: "specs.capacity" },
  { label: "Energy rating", key: "specs.energyRating" },
  { label: "Warranty", key: "warranty.manufacturer" },
  { label: "Seller cover", key: "warranty.seller" }
];

function get(item, path) {
  return path.split(".").reduce((value, key) => value?.[key], item);
}

export default function CompareClient() {
  const router = useRouter();
  const items = useSelector((state) => state.compare.items);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !items.length) {
    return (
      <div className={styles.empty}>
        <h2>Your comparison is waiting.</h2>
        <p>
          Add up to four items to compare dimensions, materials, capacity and warranty side by side.
        </p>
        <Button href="/furniture">
          Explore the collection
        </Button>
      </div>
    );
  }

  const add = (item) => {
    if (!isAuthenticated) {
      dispatch(showToast({
        message: "Please sign in to add items to your shopping bag",
        kind: "info"
      }));
      router.push("/account?redirect=/compare");
      return;
    }
    dispatch(addItem({ ...item, variantId: item.sku, qty: 1 }));
    dispatch(
      showToast({
        message: `${item.name} added to your bag`,
        kind: "success"
      })
    );
  };

  return (
    <div className={styles.compare}>
      <div className={styles.top}>
        <span>
          {items.length} of 4 products
        </span>
        <button type="button" onClick={() => dispatch(clearCompare())}>
          Clear comparison
        </button>
      </div>
      <div className={styles.products}>
        <ProductGrid products={items} compact />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <tbody>
            {fieldDefs.map(({ label, key, unit, isCategory }) => {
              const vals = items.map((item) => get(item, key));
              const unique = new Set(vals.map((value) => String(value ?? ""))).size > 1;
              return (
                <tr key={label}>
                  <th>{label}</th>
                  {items.map((item, index) => {
                    let valDisplay = vals[index] ?? "—";
                    if (label === "Price") {
                      valDisplay = formatINR(vals[index]);
                    } else if (unit && vals[index] != null) {
                      valDisplay = `${vals[index]} ${unit}`;
                    } else if (isCategory && valDisplay !== "—") {
                      valDisplay = getLocalizedCategoryName(valDisplay);
                    }
                    return (
                      <td key={item.slug} className={unique ? styles.diff : ""}>
                        {String(valDisplay)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            <tr>
              <th>Action</th>
              {items.map((item) => (
                <td key={item.slug}>
                  <div className={styles.action}>
                    <button type="button" onClick={() => add(item)}>
                      Add to bag
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(removeCompareItem(item.slug))}
                    >
                      Remove
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className={styles.note}>
        Always confirm exact room dimensions and doorway clearance before ordering.
      </p>
    </div>
  );
}
