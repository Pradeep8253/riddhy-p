"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { addItem } from "@/store/cartSlice";
import { toggleWishlist } from "@/store/wishlistSlice";
import { showToast, setCartDrawer } from "@/store/uiSlice";
import { formatPriceSafe } from "@/lib/pricing";
import { IMG } from "@/lib/images";
import {
  getLocalizedProductName,
  getLocalizedCategoryName,
  getLocalizedBadge,
  getLocalizedProductTagline,
} from "@/lib/translate-backend";
import Icon from "./Icon";
import QuickViewModal from "./QuickViewModal";
import { getProductWhatsAppUrl } from "@/lib/site-config";
import styles from "./ProductCard.module.css";

export default function ProductCard({ product, compact = false }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useSelector((state) => state.ui?.locale || "en");
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const wishlisted = useSelector((state) =>
    Boolean(
      state.auth?.isAuthenticated &&
      state.wishlist.items.some((item) => item.slug === product.slug),
    ),
  );
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isWishlisted = mounted ? wishlisted : false;
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const waUrl = getProductWhatsAppUrl(product, locale);

  const priceFormatted = formatPriceSafe(product.price);
  const mrpFormatted = formatPriceSafe(product.mrp);
  const hasValidPrice = Boolean(priceFormatted);

  const add = () => {
    if (!hasValidPrice) return;
    if (!isAuthenticated) {
      dispatch(
        showToast({
          message: "Please sign in to add items to your shopping bag",
          kind: "info",
        }),
      );
      router.push(`/account?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    dispatch(addItem({ ...product, qty: 1, variantId: product.sku }));
    dispatch(
      showToast({
        message: `${product.name} added to your bag`,
        kind: "success",
      }),
    );
    dispatch(setCartDrawer(true));
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      dispatch(
        showToast({
          message: "Please sign in to save pieces to your wishlist",
          kind: "info",
        }),
      );
      router.push(`/account?redirect=${encodeURIComponent(pathname || "/")}`);
      return;
    }
    dispatch(toggleWishlist(product));
    dispatch(
      showToast({
        message: wishlisted
          ? "Removed from your wishlist"
          : `${product.name} saved to your wishlist`,
        kind: "success",
      }),
    );
  };

  // Gallery image fallback logic with responsive sizes & blur
  const image =
    product.gallery?.[0]?.mediumUrl ||
    product.gallery?.[0]?.url ||
    product.image ||
    IMG.products.sofa;

  const secondaryImage =
    product.gallery?.[1]?.mediumUrl ||
    product.gallery?.[1]?.url ||
    (product.room && IMG.rooms?.find?.((r) => r.slug === product.room)?.src) ||
    null;

  const blurDataURL =
    product.gallery?.[0]?.blurDataURL ||
    "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

  // Tag badge on top-left
  const tagBadge =
    product.badgeText ||
    (product.tags?.includes("best-selling")
      ? "Best Seller"
      : product.tags?.includes("popular")
        ? "Popular"
        : product.tags?.includes("trending")
          ? "Trending"
          : product.tags?.includes("new-arrival")
            ? "New"
            : product.tags?.includes("deal")
              ? "Deal"
              : null);

  const isOutOfStock = Number(product.stock ?? 1) <= 0;
  const isLowStock = !isOutOfStock && Number(product.stock ?? 1) <= 3;

  return (
    <article className={`${styles.card} ${compact ? styles.compact : ""}`}>
      <div className={styles.media}>
        <Link
          href={`/product/${product.slug}`}
          className={styles.imageLink}
          aria-label={`View ${product.name}`}
        >
          <Image
            src={image}
            alt={product.imageAlt || `${product.name} product photography`}
            fill
            sizes="(max-width: 620px) 44vw, (max-width: 980px) 30vw, 22vw"
            placeholder="blur"
            blurDataURL={blurDataURL}
            className={`${styles.primaryImg} ${secondaryImage ? styles.hasSecondary : ""}`}
            unoptimized={
              image.startsWith("/api/files/") || image.startsWith("/uploads/")
            }
          />
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} alternate view`}
              fill
              sizes="(max-width: 620px) 44vw, (max-width: 980px) 30vw, 22vw"
              className={styles.secondaryImg}
              unoptimized={
                secondaryImage.startsWith("/api/files/") ||
                secondaryImage.startsWith("/uploads/")
              }
            />
          )}
        </Link>

        {/* Tag Badge Top-Left */}
        {tagBadge && !isOutOfStock && (
          <span className={styles.tagBadgeTopLeft}>
            {getLocalizedBadge(tagBadge, locale)}
          </span>
        )}

        {/* Stock / Discount Badges */}
        {isOutOfStock ? (
          <span className={styles.outOfStockBadge}>Sold Out</span>
        ) : isLowStock ? (
          <span
            className={styles.lowStockBadge}
          >{`Only ${product.stock} left`}</span>
        ) : product.discount > 0 ? (
          <span
            className={`${styles.discount} ${tagBadge ? styles.discountOffset : ""}`}
          >
            {product.discount}% off
          </span>
        ) : null}

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.quickViewBtn}
            aria-label="Quick view product details"
            title="Quick view"
            onClick={() => setQuickViewOpen(true)}
          >
            <Icon name="search" size={15} />
          </button>
          <button
            type="button"
            aria-label={
              isWishlisted ? "Remove from wishlist" : "Add to wishlist"
            }
            aria-pressed={isWishlisted}
            onClick={handleWishlist}
          >
            <Icon name="heart" size={18} />
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waControlBtn}
            aria-label={`Chat on WhatsApp about ${product.name}`}
            title="Chat on WhatsApp"
          >
            <Icon name="whatsapp" size={17} color="#25D366" />
          </a>
        </div>
      </div>

      <div className={styles.details}>
        <div className={styles.meta}>
          {product.brand || "RF Riddhy"} <span>·</span>{" "}
          {getLocalizedCategoryName(
            product.categoryLabel || product.category,
            locale,
          )}
        </div>
        <Link href={`/product/${product.slug}`} className={styles.name}>
          {getLocalizedProductName(product, locale)}
        </Link>
        {!compact && product.tagline && (
          <p className={styles.tagline}>
            {getLocalizedProductTagline(product, locale)}
          </p>
        )}

        {/* Price Row: hidden if no valid price */}
        {hasValidPrice ? (
          <div className={styles.priceRow}>
            <strong>{priceFormatted}</strong>
            {product.mrp > product.price && mrpFormatted && (
              <del>{mrpFormatted}</del>
            )}
            <span className={styles.rating}>
              {product.rating ? (
                <>
                  <Icon name="star" size={13} /> {product.rating}
                </>
              ) : (
                "Verified"
              )}
            </span>
          </div>
        ) : (
          <div
            className={styles.priceRow}
            style={{ color: "#64748b", fontSize: "0.85rem" }}
          >
            <span>Price on inquiry</span>
          </div>
        )}

        {hasValidPrice && Number(product.price) >= 8000 && !compact && (
          <div className={styles.emiSnippet}>
            ⚡ EMI ₹
            {Math.round(Number(product.price) / 6).toLocaleString("en-IN")}/mo
          </div>
        )}

        <div className={styles.cardActions}>
          <button
            type="button"
            className={styles.add}
            onClick={add}
            disabled={isOutOfStock || !hasValidPrice}
          >
            <span>
              {!hasValidPrice
                ? "Unavailable"
                : isOutOfStock
                  ? "Out of stock"
                  : "Add to bag"}
            </span>
            <Icon name="arrow" size={17} />
          </button>
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waCardBtn}
            aria-label={`Inquire about ${product.name} on WhatsApp`}
            title="Inquire on WhatsApp"
          >
            <Icon name="whatsapp" size={18} color="#25D366" />
          </a>
        </div>
      </div>

      {quickViewOpen && (
        <QuickViewModal
          product={product}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </article>
  );
}
