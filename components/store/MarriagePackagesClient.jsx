'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/ui/Icon';
import { formatINR } from '@/lib/pricing';
import { siteConfig } from '@/lib/site-config';
import styles from './MarriagePackages.module.css';

export default function MarriagePackagesClient({ packages = [] }) {
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState(new Set());
  const [showPosterModal, setShowPosterModal] = useState(false);

  const openDetails = (pkg) => {
    setSelectedPackage(pkg);
    setIsCustomizing(false);
    setSelectedAddons(new Set());
  };

  const openCustomize = (pkg) => {
    setSelectedPackage(pkg);
    setIsCustomizing(true);
    const defaults = new Set();
    (pkg.customizableAddons || []).forEach((a, i) => {
      if (a.includedByDefault) defaults.add(i);
    });
    setSelectedAddons(defaults);
  };

  const closeDrawer = () => {
    setSelectedPackage(null);
    setIsCustomizing(false);
    setSelectedAddons(new Set());
  };

  const toggleAddon = (index) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const calculateTotal = (pkg) => {
    if (!pkg) return 0;
    let total = pkg.price;
    selectedAddons.forEach((idx) => {
      const addon = pkg.customizableAddons?.[idx];
      if (addon) total += addon.price;
    });
    return total;
  };

  const getWhatsAppLink = (pkg, customizedPrice = null) => {
    const phone = siteConfig?.contact?.whatsapp?.replace(/\D/g, '') || '918840245188';
    const priceText = formatINR(customizedPrice || pkg.price);
    const text = encodeURIComponent(
      `Hello Riddhy Furnitures, I am interested in ${pkg.name} (${priceText}) from your Our Packages offer. Please share itemized details and delivery schedule.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  const getBadgeClass = (tier) => {
    switch (tier) {
      case 'shagun':
        return styles.shagunBadge;
      case 'lagan':
        return styles.laganBadge;
      case 'kanyadaan':
        return styles.kanyadaanBadge;
      case 'griha-lakshmi':
        return styles.grihaLakshmiBadge;
      case 'bhagya-shree':
        return styles.bhagyaShreeBadge;
      default:
        return styles.shagunBadge;
    }
  };

  const getTierLabel = (pkg) => {
    if (pkg.tier === 'shagun') return 'Shagun Collection';
    if (pkg.tier === 'lagan') return 'Lagan Collection';
    if (pkg.tier === 'kanyadaan') return 'Kanyadaan Collection';
    if (pkg.tier === 'griha-lakshmi') return 'Griha Lakshmi Collection';
    if (pkg.tier === 'bhagya-shree') return 'Bhagya Shree Collection';
    return `${pkg.name}`;
  };

  return (
    <div>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.heroTag}>
            Riddhy Furnitures & Home Appliances · Mansurabad, Prayagraj
          </span>
          <h1>
            Our Packages, <em>curated</em> for your home.
          </h1>
          <p>
            Complete household furniture and smart home appliance collections designed for real life and weddings.
            Choose from all 5 comprehensive packages: Shagun (₹49,999), Lagan (₹59,999), Kanyadaan (₹69,999),
            Griha Lakshmi (₹79,999), and Bhagya Shree (₹89,999).
          </p>

          <div className={styles.noticeBar}>
            <Icon name="check" size={15} />
            <span>
              All 5 packages on display at Mansurabad, Prayagraj · Mob: 8840245188, 7317815350
            </span>
          </div>

          <div className={styles.heroActions}>
            <button
              type="button"
              className={styles.btnPoster}
              onClick={() => setShowPosterModal(true)}
            >
              <Icon name="eye" size={15} /> View Official Offer Poster
            </button>
            <a
              href="https://wa.me/918840245188?text=Hello%20Riddhy%20Furnitures%2C%20I%20want%20to%20enquire%20about%20your%205%20Packages."
              target="_blank"
              rel="noopener noreferrer"
              className={styles.btnHeroContact}
            >
              <Icon name="whatsapp" size={15} /> Showroom WhatsApp: 8840245188
            </a>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className={styles.packagesSection}>
        <div className="container">
          <div className={styles.grid}>
            {packages.map((pkg) => {
              const isFlagship = pkg.tier === 'bhagya-shree' || pkg.tier === 'griha-lakshmi';
              const itemCount = (pkg.items || []).length;

              return (
                <article
                  key={pkg.slug}
                  className={`${styles.packageCard} ${isFlagship ? styles.featuredCard : ''}`}
                >
                  {pkg.highlightBadge && (
                    <div className={styles.featuredRibbon}>{pkg.highlightBadge}</div>
                  )}

                  <div className={styles.cardImageWrapper}>
                    <Image
                      src={pkg.thumbnailImage || pkg.bannerImage}
                      alt={pkg.name}
                      fill
                      sizes="(max-width: 960px) 100vw, 33vw"
                      className={styles.cardImg}
                      unoptimized
                    />
                  </div>

                  <div className={styles.cardHeader}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span className={`${styles.tierBadge} ${getBadgeClass(pkg.tier)}`}>
                        {getTierLabel(pkg)}
                      </span>
                      {pkg.hindiName && (
                        <span className={styles.hindiTag}>{pkg.hindiName}</span>
                      )}
                    </div>
                    <h2>{pkg.name}</h2>
                    <p>{pkg.tagline || pkg.description}</p>
                  </div>

                  <div className={styles.priceArea}>
                    <div className={styles.priceCol}>
                      <span className={styles.mainPrice}>{formatINR(pkg.price)}</span>
                      {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                        <span className={styles.origPrice}>{formatINR(pkg.originalPrice)}</span>
                      )}
                    </div>
                    {pkg.savings && (
                      <span className={styles.savingsBadge}>
                        {`Save ${formatINR(pkg.savings)}`}
                      </span>
                    )}
                  </div>

                  {/* All Points Checklist - English Language */}
                  <div className={styles.itemsList}>
                    <div className={styles.itemsHeader}>
                      <span className={styles.itemsCount}>
                        <Icon name="check" size={13} />
                        All {itemCount} Included Points:
                      </span>
                      <span className={styles.pointsBadge}>Full Checklist</span>
                    </div>

                    <div className={styles.itemsScrollBox}>
                      {(pkg.items || []).map((item, idx) => (
                        <div key={idx} className={styles.itemRow}>
                          <div className={styles.itemCheck}>
                            <Icon name="check" size={11} />
                          </div>
                          <div className={styles.itemText}>
                            <span className={styles.itemTitle}>
                              <span className={styles.itemQty}>{item.quantity > 1 ? `${item.quantity}x` : '1x'}</span>
                              {item.title}
                            </span>
                            {item.specs && (
                              <span className={styles.itemSpecs}>{item.specs}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={() => openDetails(pkg)}
                    >
                      View Full Details ({itemCount} Items) <Icon name="arrow" size={14} />
                    </button>

                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => openCustomize(pkg)}
                    >
                      <Icon name="sliders" size={14} /> Customize Add-ons & Upgrades
                    </button>

                    <a
                      href={getWhatsAppLink(pkg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnWhatsApp}
                    >
                      <Icon name="whatsapp" size={15} /> WhatsApp for Quote
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Slide-out Drawer for Itemized Details & Customization */}
      {selectedPackage && (
        <div className={styles.drawerOverlay} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <span className={`${styles.tierBadge} ${getBadgeClass(selectedPackage.tier)}`}>
                  {getTierLabel(selectedPackage)}
                </span>
                <h2>{selectedPackage.name}</h2>
                <p>
                  {isCustomizing
                    ? 'Select optional add-ons to customize your home package.'
                    : `Complete itemized list of all ${(selectedPackage.items || []).length} points in English with specifications.`}
                </p>
              </div>
              <button type="button" className={styles.closeBtn} onClick={closeDrawer} aria-label="Close drawer">
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {isCustomizing ? (
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', margin: '0 0 16px', fontSize: 18, color: 'var(--rf-forest-deep)' }}>
                    Optional Add-ons & Upgrades
                  </h3>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {(selectedPackage.customizableAddons || []).map((addon, idx) => {
                      const isChecked = selectedAddons.has(idx);
                      return (
                        <div
                          key={idx}
                          className={`${styles.addonCard} ${isChecked ? styles.selected : ''}`}
                          onClick={() => toggleAddon(idx)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ width: 18, height: 18, accentColor: 'var(--rf-green-700)' }}
                            />
                            <div className={styles.addonInfo}>
                              <b>{addon.title}</b>
                              <span>{addon.description}</span>
                            </div>
                          </div>
                          <div className={styles.addonPrice}>+{formatINR(addon.price)}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 24, padding: 18, borderRadius: 14, background: '#f5efe4' }}>
                    <b style={{ display: 'block', fontSize: 13, color: 'var(--rf-forest-deep)', marginBottom: 4 }}>
                      Need Custom Fabric, Wood Finishes, or Room Layout Advice?
                    </b>
                    <p style={{ margin: 0, fontSize: 12, color: '#687269', lineHeight: 1.5 }}>
                      All package items can be customized in terms of wood polish (Teak, Walnut, Honey), fabric colors,
                      and appliance brands upon consultation with our showroom team in Mansurabad, Prayagraj.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {selectedPackage.categories?.map((cat) => {
                    const catItems = (selectedPackage.items || []).filter(
                      (item) => item.category === cat
                    );
                    if (!catItems.length) return null;

                    return (
                      <div key={cat} className={styles.categoryGroup} style={{ marginBottom: 20 }}>
                        <h4>{cat}</h4>
                        <div style={{ display: 'grid', gap: 8 }}>
                          {catItems.map((item, i) => (
                            <div key={i} className={styles.detailItemCard}>
                              <div className={styles.detailItemInfo}>
                                <b>
                                  <span style={{ color: 'var(--rf-green-700)', marginRight: 6 }}>
                                    {item.quantity > 1 ? `${item.quantity}x ` : '1x '}
                                  </span>
                                  {item.title}
                                </b>
                                <span>{item.specs}</span>
                              </div>
                              <span className={styles.qtyBadge}>Qty: {item.quantity || 1}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.drawerFooter}>
              <div className={styles.drawerTotal}>
                <span>
                  {isCustomizing ? 'Estimated Package Total' : 'Package Price'}
                </span>
                <b>{formatINR(calculateTotal(selectedPackage))}</b>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <a
                  href={getWhatsAppLink(selectedPackage, calculateTotal(selectedPackage))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnWhatsApp}
                  style={{ minHeight: 44, padding: '0 18px' }}
                >
                  <Icon name="whatsapp" size={16} /> WhatsApp Quote
                </a>

                <Link
                  href={`/consultation?package=${selectedPackage.slug}`}
                  className={styles.btnPrimary}
                  style={{ minHeight: 44, padding: '0 20px' }}
                >
                  Request Consultation <Icon name="arrow" size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Poster / Pamphlet Modal */}
      {showPosterModal && (
        <div className={styles.posterModalOverlay} onClick={() => setShowPosterModal(false)}>
          <div className={styles.posterModal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.posterModalHead}>
              <div>
                <h3>RIDDHY FURNITURES AND HOME APPLIANCES</h3>
                <p>Mansurabad, Prayagraj · Mob: 8840245188, 7317815350</p>
              </div>
              <button
                type="button"
                className={styles.closeBtn}
                onClick={() => setShowPosterModal(false)}
                aria-label="Close poster view"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className={styles.posterModalBody}>
              <Image
                src="/images/packages/our-packages-poster.jpg"
                alt="Riddhy Furnitures and Home Appliances - 5 Packages Official Poster"
                width={560}
                height={840}
                className={styles.posterImg}
                priority
              />
            </div>

            <div className={styles.posterModalFooter}>
              <div className={styles.posterContacts}>
                <span>Showroom: <strong>Mansurabad, Prayagraj</strong></span>
              </div>
              <a
                href="https://wa.me/918840245188?text=Hello%20Riddhy%20Furnitures%2C%20I%20viewed%20your%205%20Packages%20poster%20and%20want%20to%20place%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className={styles.btnWhatsApp}
                style={{ minHeight: 40, padding: '0 16px' }}
              >
                <Icon name="whatsapp" size={15} /> Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
