'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setLocale, setCartDrawer } from '@/store/uiSlice';
import { formatINR } from '@/lib/demo-data';
import { getLocalizedProductName, getLocalizedCategoryName } from '@/lib/translate-backend';
import BrandMark from '@/components/ui/BrandMark';
import Icon from '@/components/ui/Icon';
import { tr } from '@/lib/i18n';
import styles from './Header.module.css';

const nav = [
  { key: 'furniture', href: '/furniture', children: ['sofas', 'beds', 'wardrobes', 'dining-sets', 'study-tables'] },
  { key: 'appliances', href: '/appliances', children: ['refrigerators', 'washing-machines', 'air-conditioners', 'televisions'] },
  { key: 'rooms', href: '/rooms/living', children: ['living', 'bedroom', 'dining', 'study', 'kitchen'] },
  { key: 'offers', href: '/offers' }
];

const labels = {
  sofas: 'Sofas',
  beds: 'Beds',
  wardrobes: 'Wardrobes',
  'dining-sets': 'Dining',
  'study-tables': 'Study',
  refrigerators: 'Refrigerators',
  'washing-machines': 'Washers',
  'air-conditioners': 'Air conditioners',
  televisions: 'Televisions',
  living: 'Living room',
  bedroom: 'Bedroom',
  dining: 'Dining',
  study: 'Study',
  kitchen: 'Kitchen & utility'
};

const labelsHi = {
  sofas: 'सोफ़ा',
  beds: 'बिस्तर',
  wardrobes: 'अलमारी',
  'dining-sets': 'डाइनिंग',
  'study-tables': 'स्टडी टेबल',
  refrigerators: 'रेफ़्रिजरेटर',
  'washing-machines': 'वॉशिंग मशीन',
  'air-conditioners': 'एयर कंडीशनर',
  televisions: 'टीवी',
  living: 'लिविंग रूम',
  bedroom: 'बेडरूम',
  dining: 'डाइनिंग',
  study: 'स्टडी',
  kitchen: 'किचन एवं यूटिलिटी'
};

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const cartCount = useSelector((state) => state.auth?.isAuthenticated ? state.cart.items.reduce((sum, item) => sum + item.qty, 0) : 0);
  const wishlistCount = useSelector((state) => state.auth?.isAuthenticated ? state.wishlist.items.length : 0);
  const locale = useSelector((state) => state.ui.locale);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const displayCartCount = mounted ? cartCount : 0;
  const displayWishlistCount = mounted ? wishlistCount : 0;

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);

  // Debounced live search
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            setSearchResults(data.data.slice(0, 4));
          } else {
            setSearchResults([]);
          }
        })
        .catch(() => setSearchResults([]))
        .finally(() => setSearchLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (term) {
      router.push(`/search?q=${encodeURIComponent(term)}`);
      setSearchFocused(false);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.announcement}>
        <span>{locale === 'hi' ? 'आपके घर के लिए सोच-समझकर चुनी चीज़ें' : 'Thoughtful choices for a home that feels like you'}</span>
        <div className={styles.announceRightGroup}>
          <span className={styles.announceRight}>{locale === 'hi' ? 'डिलीवरी · इंस्टॉलेशन · देखभाल' : 'Delivery · Installation · Aftercare, made clear'}</span>
          <button
            type="button"
            className={styles.langToggle}
            onClick={() => dispatch(setLocale(locale === 'en' ? 'hi' : 'en'))}
            aria-label={locale === 'en' ? 'Switch website to Hindi' : 'अंग्रेज़ी में बदलें'}
          >
            <span className={locale === 'en' ? styles.langActive : ''}>EN</span>
            <span className={styles.langSep}>/</span>
            <span className={locale === 'hi' ? styles.langActive : ''}>हिन्दी</span>
          </button>
        </div>
      </div>

      <div className={styles.mainRow}>
        <button
          className={styles.mobileMenu}
          type="button"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
        </button>

        <Link href="/" className={styles.brand} aria-label="RF Riddhy home">
          <div className={styles.logoBadge}>
            <Image
              src="/riddhy-logo.jpeg"
              alt="RF Riddhy Furniture & Appliances"
              width={46}
              height={46}
              priority
              className={styles.logoImg}
            />
          </div>
          <span>
            <b>RF | RIDDHY</b>
            <small>FURNITURE & HOME APPLIANCES</small>
          </span>
        </Link>

        <div className={styles.searchWrapper} ref={searchRef}>
          <form
            className={`${styles.search} ${searchOpen ? styles.searchActive : ''}`}
            onSubmit={submitSearch}
            role="search"
          >
            <Icon name="search" size={19} />
            <input
              aria-label={tr(locale, 'search')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              placeholder={tr(locale, 'search')}
            />
            <button type="submit" aria-label="Submit search">
              {locale === 'hi' ? 'खोजें' : 'Search'}
            </button>
          </form>

          {/* Live Search Dropdown */}
          {searchFocused && (
            <div className={styles.searchDropdown}>
              {query.trim().length >= 2 ? (
                <>
                  <div className={styles.searchDropdownSection}>
                    <div className={styles.searchDropdownHeader}>
                      {searchLoading
                        ? 'Searching collection…'
                        : searchResults.length > 0
                        ? `Matching pieces (${searchResults.length})`
                        : `No direct match for "${query}"`}
                    </div>

                    {searchResults.map((item) => {
                      const thumb =
                        item.gallery?.[0]?.thumbUrl ||
                        item.gallery?.[0]?.url ||
                        item.image ||
                        '/images/product-sofa.webp';

                      return (
                        <Link
                          key={item.slug}
                          href={`/product/${item.slug}`}
                          className={styles.searchResultItem}
                          onClick={() => {
                            setSearchFocused(false);
                            setQuery('');
                          }}
                        >
                          <div className={styles.searchItemThumb}>
                            <img src={thumb} alt={item.name} />
                          </div>
                          <div className={styles.searchItemInfo}>
                            <span className={styles.searchItemName}>
                              {getLocalizedProductName(item, locale)}
                            </span>
                            <span className={styles.searchItemCat}>
                              {getLocalizedCategoryName(item.categoryLabel || item.category, locale)}
                            </span>
                          </div>
                          <span className={styles.searchItemPrice}>
                            {formatINR(item.price)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>

                  <Link
                    href={`/search?q=${encodeURIComponent(query.trim())}`}
                    className={styles.searchDropdownFooter}
                    onClick={() => setSearchFocused(false)}
                  >
                    <span>View all matching results</span>
                    <Icon name="arrow" size={14} />
                  </Link>
                </>
              ) : (
                <div className={styles.searchDropdownSection}>
                  <div className={styles.searchDropdownHeader}>
                    {locale === 'hi' ? 'लोकप्रिय खोजें' : 'Popular searches'}
                  </div>
                  <div className={styles.searchTrendingRow}>
                    {['Sofas', 'Storage Beds', 'Refrigerators', 'Dining Sets', 'Marriage Packages'].map((term) => (
                      <button
                        type="button"
                        key={term}
                        className={styles.trendingChip}
                        onClick={() => {
                          setQuery(term);
                          router.push(`/search?q=${encodeURIComponent(term)}`);
                          setSearchFocused(false);
                        }}
                      >
                        <Icon name="search" size={12} />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.langActionBtn}
            onClick={() => dispatch(setLocale(locale === 'en' ? 'hi' : 'en'))}
            title={locale === 'en' ? 'वेबसाइट हिन्दी में देखें' : 'Switch to English'}
            aria-label={locale === 'en' ? 'Switch website to Hindi' : 'Switch to English'}
          >
            {locale === 'en' ? 'हिन्दी' : 'EN'}
          </button>

          <Link href="/consultation" className={styles.consultationBtn}>
            <Icon name="calendar" size={15} />
            <span>{tr(locale, 'bookConsultation')}</span>
          </Link>

          <button
            type="button"
            className={styles.searchToggle}
            aria-label="Open search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Icon name="search" size={21} />
          </button>

          <Link
            href="/wishlist"
            className={styles.iconLink}
            aria-label={`${tr(locale, 'wishlist')}${displayWishlistCount ? `, ${displayWishlistCount} items` : ''}`}
          >
            <Icon name="heart" size={21} />
            {displayWishlistCount > 0 && <i>{displayWishlistCount}</i>}
          </Link>

          <Link href="/account" className={styles.iconLink} aria-label={tr(locale, 'account')}>
            <Icon name="user" size={21} />
          </Link>

          <button
            type="button"
            className={`${styles.iconLink} ${styles.bag}`}
            onClick={() => dispatch(setCartDrawer(true))}
            aria-label={`${tr(locale, 'bag')}${displayCartCount ? `, ${displayCartCount} items` : ''}`}
          >
            <Icon name="bag" size={21} />
            <span>{tr(locale, 'bag')}</span>
            {displayCartCount > 0 && <i>{displayCartCount}</i>}
          </button>
        </div>
      </div>

      <nav className={`${styles.nav} ${menuOpen ? styles.navOpen : ''}`} aria-label="Main navigation">
        <div className={styles.navInner}>
          {nav.map((item) => (
            <div className={styles.navItem} key={item.href}>
              <Link
                className={pathname === item.href ? styles.active : ''}
                href={item.href}
                onClick={() => setMenuOpen(false)}
              >
                {tr(locale, item.key)}
              </Link>
              {item.children && (
                <div className={styles.dropdown}>
                  {item.children.map((slug) => (
                    <Link
                      key={slug}
                      href={item.href.startsWith('/rooms') ? `/rooms/${slug}` : `${item.href}/${slug}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {locale === 'hi' ? labelsHi[slug] : labels[slug]}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/packages"
            className={pathname === '/packages' || pathname === '/marriage-packages' ? styles.active : ''}
            onClick={() => setMenuOpen(false)}
          >
            {locale === 'hi' ? 'शादी पैकेज' : 'Marriage Packages'}
          </Link>

          <Link
            href="/about"
            className={pathname === '/about' ? styles.active : ''}
            onClick={() => setMenuOpen(false)}
          >
            {tr(locale, 'story')}
          </Link>

          <Link
            href="/consultation"
            className={pathname === '/consultation' ? styles.active : ''}
            onClick={() => setMenuOpen(false)}
          >
            {tr(locale, 'freeConsultation')}
          </Link>

          {/* Mobile menu Language Selector */}
          <div className={styles.mobileLangRow}>
            <span>{locale === 'hi' ? 'भाषा (Language)' : 'Language (भाषा)'}</span>
            <div className={styles.mobileLangPills}>
              <button
                type="button"
                className={locale === 'en' ? styles.activeLangPill : ''}
                onClick={() => {
                  dispatch(setLocale('en'));
                  setMenuOpen(false);
                }}
              >
                English
              </button>
              <button
                type="button"
                className={locale === 'hi' ? styles.activeLangPill : ''}
                onClick={() => {
                  dispatch(setLocale('hi'));
                  setMenuOpen(false);
                }}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </nav>

      {searchOpen && (
        <form className={styles.mobileSearch} onSubmit={submitSearch}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={locale === 'hi' ? 'संग्रह में खोजें' : 'Search the collection'}
            aria-label={tr(locale, 'search')}
          />
          <button type="submit">{locale === 'hi' ? 'खोजें' : 'Find it'}</button>
        </form>
      )}
    </header>
  );
}
