"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { setCartDrawer } from "@/store/uiSlice";
import { setQuantity, removeItem } from "@/store/cartSlice";
import { formatINR } from "@/lib/demo-data";
import { IMG } from "@/lib/images";
import Icon from "@/components/ui/Icon";
import { getProductWhatsAppUrl } from "@/lib/site-config";
import styles from "./CartDrawer.module.css";

const FREE_SHIPPING_THRESHOLD = 50000;

export default function CartDrawer() {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui?.cartDrawerOpen);
  const items = useSelector((state) => state.cart?.items || []);
  const locale = useSelector((state) => state.ui?.locale || "en");
  const drawerRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayItems = mounted ? items : [];
  const totalQty = displayItems.reduce((sum, item) => sum + (item.qty || 1), 0);
  const subtotal = displayItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.qty || 1),
    0,
  );

  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingPercent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        dispatch(setCartDrawer(false));
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, dispatch]);

  const close = () => dispatch(setCartDrawer(false));

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropOpen : ""}`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Flyout Drawer */}
      <aside
        ref={drawerRef}
        className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}
        aria-label="Shopping bag flyout"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <h2>Shopping Bag</h2>
            {totalQty > 0 && (
              <span className={styles.itemCountBadge}>{totalQty}</span>
            )}
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={close}
            aria-label="Close shopping bag"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Free Shipping Meter */}
        {displayItems.length > 0 && (
          <div className={styles.shippingBar}>
            <div className={styles.shippingText}>
              <Icon name="truck" size={15} color="var(--rf-green-700)" />
              <span>
                {shippingRemaining === 0
                  ? "🎉 You unlocked Free White-Glove Delivery & Assembly!"
                  : `Add ${formatINR(shippingRemaining)} more for Free Assembly & Delivery`}
              </span>
            </div>
            <div className={styles.progressTrack}>
              <div
                className={styles.progressBar}
                style={{ width: `${shippingPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Content / Items List */}
        {displayItems.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <Icon name="bag" size={30} />
            </div>
            <h3 className={styles.emptyTitle}>Your Bag is Empty</h3>
            <p className={styles.emptySubtitle}>
              Looks like you haven’t added any pieces yet. Explore our
              handcrafted furniture and smart home appliances.
            </p>
            <div className={styles.emptyActions}>
              <Link
                href="/furniture"
                className={styles.emptyBtn}
                onClick={close}
              >
                Furniture
              </Link>
              <Link
                href="/appliances"
                className={styles.emptyBtnOutline}
                onClick={close}
              >
                Appliances
              </Link>
            </div>
          </div>
        ) : (
          <div className={styles.itemsList}>
            {displayItems.map((item) => {
              const itemKey =
                item.variantId || item.slug || item.id || item.sku;
              const itemImage =
                item.gallery?.[0]?.thumbUrl ||
                item.gallery?.[0]?.url ||
                item.image ||
                IMG.products.sofa;

              return (
                <div key={itemKey} className={styles.cartItem}>
                  <div className={styles.itemThumbWrap}>
                    <Image
                      src={itemImage}
                      alt={item.name}
                      fill
                      sizes="76px"
                      className={styles.itemThumb}
                      unoptimized={
                        itemImage.startsWith("/api/files/") ||
                        itemImage.startsWith("/uploads/")
                      }
                    />
                  </div>

                  <div className={styles.itemInfo}>
                    <span className={styles.itemCategory}>
                      {item.categoryLabel || item.category || "Collection"}
                    </span>
                    <Link
                      href={`/product/${item.slug}`}
                      className={styles.itemName}
                      onClick={close}
                    >
                      {item.name}
                    </Link>
                    <span className={styles.itemPrice}>
                      {formatINR(item.price * item.qty)}
                    </span>

                    <div className={styles.qtyRow}>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() =>
                          dispatch(
                            setQuantity({
                              key: itemKey,
                              qty: Math.max(1, item.qty - 1),
                            }),
                          )
                        }
                        aria-label="Decrease quantity"
                      >
                        <Icon name="minus" size={13} />
                      </button>
                      <span className={styles.qtyValue}>{item.qty}</span>
                      <button
                        type="button"
                        className={styles.qtyBtn}
                        onClick={() =>
                          dispatch(
                            setQuantity({ key: itemKey, qty: item.qty + 1 }),
                          )
                        }
                        aria-label="Increase quantity"
                      >
                        <Icon name="plus" size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={styles.itemActions}>
                    <button
                      type="button"
                      className={styles.removeBtn}
                      onClick={() => dispatch(removeItem(itemKey))}
                      aria-label={`Remove ${item.name}`}
                    >
                      <Icon name="close" size={15} />
                    </button>
                    <a
                      href={getProductWhatsAppUrl(item, locale)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.itemWaBtn}
                      aria-label={`Ask about ${item.name} on WhatsApp`}
                      title={locale === "hi" ? "व्हाट्सएप पर पूछें" : "Inquire on WhatsApp"}
                    >
                      <Icon name="whatsapp" size={15} color="#25D366" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Summary */}
        {displayItems.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Estimated Subtotal</span>
              <strong className={styles.subtotalAmount}>
                {formatINR(subtotal)}
              </strong>
            </div>

            <p className={styles.checkoutNotice}>
              <Icon name="shield" size={13} color="var(--rf-green-700)" />
              Tax, shipping, and delivery discounts calculated at checkout.
            </p>

            <Link
              href="/checkout"
              className={styles.checkoutBtn}
              onClick={close}
            >
              <span>Proceed to Checkout</span>
              <Icon name="arrow" size={16} />
            </Link>

            <Link href="/cart" className={styles.viewBagLink} onClick={close}>
              View Full Bag & Apply Coupons
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
