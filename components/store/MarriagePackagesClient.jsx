'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import Icon from '@/components/ui/Icon';
import { formatINR } from '@/lib/demo-data';
import { siteConfig } from '@/lib/site-config';
import styles from './MarriagePackages.module.css';

export default function MarriagePackagesClient({ packages = [] }) {
  const locale = useSelector((state) => state.ui?.locale || 'en');
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState(new Set());

  const openDetails = (pkg) => {
    setSelectedPackage(pkg);
    setIsCustomizing(false);
    setSelectedAddons(new Set());
  };

  const openCustomize = (pkg) => {
    setSelectedPackage(pkg);
    setIsCustomizing(true);
    // Preselect default add-ons if any
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

  // Calculate live custom total
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
    const phone = siteConfig.contact.whatsapp.replace(/\D/g, '') || '919876543210';
    const priceText = formatINR(customizedPrice || pkg.price);
    const text = encodeURIComponent(
      `Hello RF Riddhy, I am interested in the ${pkg.name} (Indicative Price: ${priceText}). Please share the itemized quotation and delivery schedule for my location.`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div>
      {/* Hero Header */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroContent}`}>
          <span className={styles.heroTag}>
            {locale === 'hi' ? 'विवाह संग्रह · संपूर्ण गृह व्यवस्था' : 'Wedding Collections · Home Setup'}
          </span>
          <h1>
            {locale === 'hi' ? (
              <>विवाह पैकेज, <em>सुखी जीवन</em> की शुरुआत।</>
            ) : (
              <>Wedding Packages, <em>considered</em> for real life.</>
            )}
          </h1>
          <p>
            {locale === 'hi'
              ? 'नवविवाहित जोड़ों के लिए डिज़ाइन किए गए संपूर्ण घरेलू फ़र्नीचर और स्मार्ट उपकरणों के संग्रह। सामंजस्यपूर्ण स्टाइलिंग, प्रमाणित संरचनात्मक वारंटी और कस्टमाइज़ेबल चयन।'
              : 'Complete household furniture and smart home appliance collections designed for newly married couples. Cohesive styling, verified structural warranties, and customizable room selections.'}
          </p>
          <div className={styles.noticeBar}>
            <Icon name="check" size={15} />
            <span>
              {locale === 'hi'
                ? 'संकेतक पैकेज मूल्य दर्शाए गए हैं। परामर्श पर अनुकूलित कोटेशन उपलब्ध।'
                : 'Indicative package prices shown. Tailored quotations available upon consultation.'}
            </span>
          </div>
        </div>
      </section>

      {/* Packages Grid */}
      <section className={styles.packagesSection}>
        <div className="container">
          <div className={styles.grid}>
            {packages.map((pkg) => {
              const isPremium = pkg.tier === 'premium';
              const itemCount = (pkg.items || []).reduce((acc, item) => acc + (item.quantity || 1), 0);

              return (
                <article
                  key={pkg.slug}
                  className={`${styles.packageCard} ${isPremium ? styles.featuredCard : ''}`}
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
                    <span
                      className={`${styles.tierBadge} ${
                        pkg.tier === 'basic'
                          ? styles.basicBadge
                          : pkg.tier === 'premium'
                          ? styles.premiumBadge
                          : styles.luxuryBadge
                      }`}
                    >
                      {locale === 'hi'
                        ? (pkg.tier === 'basic' ? 'बेसिक कलेक्शन' : pkg.tier === 'premium' ? 'प्रीमियम कलेक्शन' : 'लक्ज़री कलेक्शन')
                        : `${pkg.tier} Collection`}
                    </span>
                    <h2>{pkg.name_hi && locale === 'hi' ? pkg.name_hi : pkg.name}</h2>
                    <p>{(locale === 'hi' && (pkg.tagline_hi || pkg.description_hi)) || pkg.tagline || pkg.description}</p>
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
                        {locale === 'hi' ? `बचत ${formatINR(pkg.savings)}` : `Save ${formatINR(pkg.savings)}`}
                      </span>
                    )}
                  </div>

                  <div className={styles.itemsList}>
                    <span className={styles.itemsCount}>
                      {locale === 'hi'
                        ? `इसमें ${itemCount} आवश्यक वस्तुएं शामिल हैं:`
                        : `Includes ${itemCount} Essential Items:`}
                    </span>
                    {(pkg.items || []).slice(0, 5).map((item, idx) => (
                      <div key={idx} className={styles.itemRow}>
                        <div className={styles.itemCheck}>
                          <Icon name="check" size={14} />
                        </div>
                        <div className={styles.itemText}>
                          <span className={styles.itemCategory}>{item.category}</span>
                          <span>
                            {item.quantity > 1 ? `${item.quantity}x ` : ''}
                            {item.title}
                          </span>
                        </div>
                      </div>
                    ))}
                    {(pkg.items || []).length > 5 && (
                      <div style={{ marginTop: 10, fontSize: 12, color: '#7a877d', fontWeight: 700 }}>
                        + {(pkg.items || []).length - 5} more items in this suite
                      </div>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    <button
                      type="button"
                      className={styles.btnPrimary}
                      onClick={() => openDetails(pkg)}
                    >
                      {locale === 'hi' ? 'पैकेज विवरण देखें' : 'View Package Details'} <Icon name="arrow" size={14} />
                    </button>

                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => openCustomize(pkg)}
                    >
                      <Icon name="sliders" size={14} /> {locale === 'hi' ? 'पैकेज एवं ऐड-ऑन कस्टमाइज़ करें' : 'Customize Package & Add-ons'}
                    </button>

                    <a
                      href={getWhatsAppLink(pkg)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.btnWhatsApp}
                    >
                      <Icon name="whatsapp" size={15} /> {locale === 'hi' ? 'व्हाट्सएप पर कोटेशन' : 'WhatsApp for Quote'}
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Slide-out Drawer for Details & Customization */}
      {selectedPackage && (
        <div className={styles.drawerOverlay} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.drawerHead}>
              <div>
                <span
                  className={`${styles.tierBadge} ${
                    selectedPackage.tier === 'basic'
                      ? styles.basicBadge
                      : selectedPackage.tier === 'premium'
                      ? styles.premiumBadge
                      : styles.luxuryBadge
                  }`}
                >
                  {selectedPackage.tier} Suite
                </span>
                <h2>{selectedPackage.name}</h2>
                <p>
                  {isCustomizing
                    ? 'Select optional add-ons to customize your wedding package.'
                    : 'Complete itemized list of furniture and smart appliances in this package.'}
                </p>
              </div>
              <button type="button" className={styles.closeBtn} onClick={closeDrawer} aria-label="Close drawer">
                <Icon name="close" size={18} />
              </button>
            </div>

            <div className={styles.drawerBody}>
              {/* If in customization mode */}
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
                      and appliance brands upon consultation with our interior team.
                    </p>
                  </div>
                </div>
              ) : (
                /* Itemized package list */
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
                                <b>{item.title}</b>
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

            {/* Sticky Drawer Footer */}
            <div className={styles.drawerFooter}>
              <div className={styles.drawerTotal}>
                <span>
                  {locale === 'hi'
                    ? (isCustomizing ? 'अनुमानित पैकेज कुल' : 'पैकेज मूल्य')
                    : (isCustomizing ? 'Estimated Package Total' : 'Package Price')}
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
                  <Icon name="whatsapp" size={16} /> {locale === 'hi' ? 'व्हाट्सएप कोट' : 'WhatsApp Quote'}
                </a>

                <Link
                  href={`/consultation?package=${selectedPackage.slug}`}
                  className={styles.btnPrimary}
                  style={{ minHeight: 44, padding: '0 20px' }}
                >
                  {locale === 'hi' ? 'परामर्श का अनुरोध करें' : 'Request Consultation'} <Icon name="arrow" size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
