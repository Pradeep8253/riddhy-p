"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { removeCompareItem, clearCompare } from "@/store/compareSlice";
import { addItem } from "@/store/cartSlice";
import { showToast } from "@/store/uiSlice";
import { formatINR } from "@/lib/demo-data";
import { getLocalizedCategoryName } from "@/lib/translate-backend";
import ProductGrid from "@/components/ui/ProductGrid";
import Button from "@/components/ui/Button";
import styles from "./CompareClient.module.css";

const fieldDefs = [
  { en: "Price", hi: "मूल्य", key: "price" },
  { en: "Category", hi: "श्रेणी", key: "categoryLabel", isCategory: true },
  { en: "Brand", hi: "ब्रांड", key: "brand" },
  { en: "Width", hi: "चौड़ाई", key: "dimensions.width", unit: "cm" },
  { en: "Depth", hi: "गहराई", key: "dimensions.depth", unit: "cm" },
  { en: "Height", hi: "ऊंचाई", key: "dimensions.height", unit: "cm" },
  { en: "Material", hi: "सामग्री", key: "specs.material" },
  { en: "Capacity", hi: "क्षमता", key: "specs.capacity" },
  { en: "Energy rating", hi: "ऊर्जा रेटिंग", key: "specs.energyRating" },
  { en: "Warranty", hi: "वारंटी", key: "warranty.manufacturer" },
  { en: "Seller cover", hi: "विक्रेता सुरक्षा", key: "warranty.seller" }
];

function get(item, path) {
  return path.split(".").reduce((value, key) => value?.[key], item);
}

export default function CompareClient() {
  const router = useRouter();
  const items = useSelector((state) => state.compare.items);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const locale = useSelector((state) => state.ui?.locale || "en");
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !items.length) {
    return (
      <div className={styles.empty}>
        <h2>{locale === "hi" ? "आपकी तुलना सूची खाली है।" : "Your comparison is waiting."}</h2>
        <p>
          {locale === "hi"
            ? "आयाम, सामग्री, क्षमता और वारंटी की आमने-सामने तुलना करने के लिए अधिकतम 4 उत्पाद जोड़ें।"
            : "Add up to four items to compare dimensions, materials, capacity and warranty side by side."}
        </p>
        <Button href="/furniture">
          {locale === "hi" ? "कलेक्शन देखें" : "Explore the collection"}
        </Button>
      </div>
    );
  }

  const add = (item) => {
    if (!isAuthenticated) {
      dispatch(showToast({
        message: locale === "hi" ? "शॉपिंग बैग में जोड़ने के लिए कृपया साइन इन करें" : "Please sign in to add items to your shopping bag",
        kind: "info"
      }));
      router.push("/account?redirect=/compare");
      return;
    }
    dispatch(addItem({ ...item, variantId: item.sku, qty: 1 }));
    dispatch(
      showToast({
        message: locale === "hi" ? `${item.name} आपके बैग में जोड़ा गया` : `${item.name} added to your bag`,
        kind: "success"
      })
    );
  };

  return (
    <div className={styles.compare}>
      <div className={styles.top}>
        <span>
          {locale === "hi" ? `4 में से ${items.length} उत्पाद` : `${items.length} of 4 products`}
        </span>
        <button type="button" onClick={() => dispatch(clearCompare())}>
          {locale === "hi" ? "तुलना सूची साफ़ करें" : "Clear comparison"}
        </button>
      </div>
      <div className={styles.products}>
        <ProductGrid products={items} compact />
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <tbody>
            {fieldDefs.map(({ en, hi, key, unit, isCategory }) => {
              const label = locale === "hi" ? hi : en;
              const vals = items.map((item) => get(item, key));
              const unique = new Set(vals.map((value) => String(value ?? ""))).size > 1;
              return (
                <tr key={en}>
                  <th>{label}</th>
                  {items.map((item, index) => {
                    let valDisplay = vals[index] ?? "—";
                    if (en === "Price") {
                      valDisplay = formatINR(vals[index]);
                    } else if (unit && vals[index] != null) {
                      valDisplay = `${vals[index]} ${unit}`;
                    } else if (isCategory && valDisplay !== "—") {
                      valDisplay = getLocalizedCategoryName(valDisplay, locale);
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
              <th>{locale === "hi" ? "क्रिया" : "Action"}</th>
              {items.map((item) => (
                <td key={item.slug}>
                  <div className={styles.action}>
                    <button type="button" onClick={() => add(item)}>
                      {locale === "hi" ? "बैग में जोड़ें" : "Add to bag"}
                    </button>
                    <button
                      type="button"
                      onClick={() => dispatch(removeCompareItem(item.slug))}
                    >
                      {locale === "hi" ? "हटाएं" : "Remove"}
                    </button>
                  </div>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <p className={styles.note}>
        {locale === "hi"
          ? "ऑर्डर करने से पहले हमेशा कमरे के सटीक माप और दरवाज़े के क्लीयरेंस की जांच कर लें।"
          : "Always confirm exact room dimensions and doorway clearance before ordering."}
      </p>
    </div>
  );
}
