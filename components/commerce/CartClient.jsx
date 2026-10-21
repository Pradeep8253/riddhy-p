"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { removeItem, setQuantity } from "@/store/cartSlice";
import { formatINR } from "@/lib/demo-data";
import { IMG } from "@/lib/images";
import Button from "@/components/ui/Button";
import Icon from "@/components/ui/Icon";
import { getProductWhatsAppUrl } from "@/lib/site-config";
import styles from "./CartClient.module.css";

const FREE_SHIPPING_THRESHOLD = 50000;

export default function CartClient() {
  const items = useSelector((state) => state.cart.items);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const authChecked = useSelector((state) => state.auth?.checked);
  const dispatch = useDispatch();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleApplyCoupon = (e) => {
    e?.preventDefault();
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === "WELCOME10" || code === "RIDDHY10") {
      const discount = Math.round(subtotal * 0.1);
      setAppliedCoupon({ code, discount, label: "10% Welcome Discount" });
      setCouponCode("");
    } else if (code === "FESTIVE5") {
      const discount = Math.round(subtotal * 0.05);
      setAppliedCoupon({ code, discount, label: "5% Festive Offer" });
      setCouponCode("");
    } else if (code === "FLAT2000") {
      const discount = Math.min(2000, subtotal);
      setAppliedCoupon({ code, discount, label: "Flat ₹2,000 Off" });
      setCouponCode("");
    } else {
      setCouponError(
        "Invalid or expired coupon code. Try WELCOME10 or FLAT2000.",
      );
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const estimatedTotal = Math.max(0, subtotal - discountAmount);
  const shippingProgress = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  if (!mounted) {
    return (
      <div className={styles.empty}>
        <span>RF</span>
        <h2>Your shopping bag is empty.</h2>
        <p>Explore our curated furniture and appliances crafted for enduring comfort.</p>
        <div>
          <Button href="/furniture">Explore furniture</Button>
          <Button href="/appliances" variant="outline">
            Explore appliances
          </Button>
        </div>
      </div>
    );
  }

  if (authChecked && !isAuthenticated) {
    return (
      <div className={styles.empty}>
        <span>RF</span>
        <h2>Sign in to view your bag</h2>
        <p>Sign in to access your saved pieces and synchronize your bag across devices.</p>
        <div>
          <Button href="/account?redirect=/cart">
            Sign in to continue
          </Button>
          <Button href="/furniture" variant="outline">
            Explore furniture
          </Button>
        </div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.empty}>
        <span>RF</span>
        <h2>Your shopping bag is empty.</h2>
        <p>Explore our curated furniture and appliances crafted for enduring comfort.</p>
        <div>
          <Button href="/furniture">Explore furniture</Button>
          <Button href="/appliances" variant="outline">
            Explore appliances
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.items}>
        {/* Free Shipping Progress Bar */}
        <div className={styles.shippingBar}>
          <div className={styles.shippingText}>
            <Icon name="truck" size={16} />
            <span>
              {shippingRemaining === 0
                ? "🎉 Congratulations! You have unlocked Free White-Glove Delivery & Assembly."
                : `Add ${formatINR(shippingRemaining)} more to unlock Free White-Glove Delivery & Assembly!`}
            </span>
          </div>
          <div className={styles.shippingProgressTrack}>
            <div
              className={styles.shippingProgressBar}
              style={{ width: `${shippingProgress}%` }}
            />
          </div>
        </div>

        {items.map((item) => {
          const key = item.variantId || item.slug || item.id;
          return (
            <article className={styles.item} key={key}>
              <Link href={`/product/${item.slug}`} className={styles.image}>
                <Image
                  src={item.image || IMG.products.sofa}
                  alt={item.imageAlt || `${item.name} demo illustration`}
                  fill
                  sizes="120px"
                  unoptimized
                />
              </Link>
              <div className={styles.details}>
                <span>
                  {item.brand || "Riddhy Select"} ·{" "}
                  {item.categoryLabel || "Home"}
                </span>
                <Link href={`/product/${item.slug}`}>
                  <b>{item.name}</b>
                </Link>
                <small>
                  {item.dimensions
                    ? `${item.dimensions.width} × ${item.dimensions.depth} × ${item.dimensions.height} cm`
                    : ""}
                </small>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                  <button type="button" onClick={() => dispatch(removeItem(key))}>
                    Remove
                  </button>
                  <a
                    href={getProductWhatsAppUrl(item, locale)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#128c7e',
                      textDecoration: 'none'
                    }}
                    title="Inquire on WhatsApp"
                  >
                    <Icon name="whatsapp" size={13} color="#25D366" />
                    <span>WhatsApp Inquiry</span>
                  </a>
                </div>
              </div>
              <div className={styles.controls}>
                <strong>{formatINR(item.price * item.qty)}</strong>
                <div className={styles.qty}>
                  <button
                    type="button"
                    aria-label={`Decrease ${item.name} quantity`}
                    onClick={() =>
                      dispatch(setQuantity({ key, qty: item.qty - 1 }))
                    }
                  >
                    <Icon name="minus" size={13} />
                  </button>
                  <span>{item.qty}</span>
                  <button
                    type="button"
                    aria-label={`Increase ${item.name} quantity`}
                    onClick={() =>
                      dispatch(setQuantity({ key, qty: item.qty + 1 }))
                    }
                  >
                    <Icon name="plus" size={13} />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <aside className={styles.summary}>
        <span className={styles.kicker}>Your Order</span>
        <h2>Order Summary</h2>
        <div className={styles.line}>
          <span>Items Subtotal</span>
          <b>{formatINR(subtotal)}</b>
        </div>

        {appliedCoupon && (
          <div className={styles.line} style={{ color: "#1b5e20" }}>
            <span>Coupon ({appliedCoupon.code})</span>
            <b>- {formatINR(appliedCoupon.discount)}</b>
          </div>
        )}

        <div className={styles.line}>
          <span>White-Glove Delivery & Assembly</span>
          <span>
            {shippingRemaining === 0 ? (
              <strong style={{ color: "#1b5e20" }}>FREE</strong>
            ) : (
              "Calculated at checkout"
            )}
          </span>
        </div>
        <div className={styles.line}>
          <span>Taxes (GST)</span>
          <span>Calculated at checkout</span>
        </div>
        <div className={`${styles.line} ${styles.total}`}>
          <span>Estimated Total</span>
          <b>{formatINR(estimatedTotal)}</b>
        </div>

        {/* Promo Code Input */}
        <div className={styles.couponSection}>
          <form className={styles.couponForm} onSubmit={handleApplyCoupon}>
            <input
              type="text"
              className={styles.couponInput}
              placeholder="Promo / Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button type="submit" className={styles.couponBtn}>
              Apply
            </button>
          </form>
          {couponError && (
            <div style={{ color: "#c62828", fontSize: 10, marginTop: 4 }}>
              {couponError}
            </div>
          )}
          {appliedCoupon && (
            <div className={styles.couponSuccess}>
              <span>✓ {appliedCoupon.label} applied!</span>
              <button
                type="button"
                className={styles.couponRemove}
                onClick={() => setAppliedCoupon(null)}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <p>Delivery and assembly schedule confirmed after checkout.</p>
        <Button href="/checkout" size="lg" className={styles.checkout}>
          Continue to Checkout <Icon name="arrow" size={16} />
        </Button>
        <div className={styles.secure}>
          100% Secure Checkout · Direct Manufacturer Warranty
        </div>
      </aside>
    </div>
  );
}
