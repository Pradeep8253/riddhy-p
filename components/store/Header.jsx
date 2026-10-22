'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setCartDrawer } from '@/store/uiSlice';
import { formatINR } from '@/lib/demo-data';
import { getLocalizedProductName, getLocalizedCategoryName } from '@/lib/translate-backend';
import BrandMark from '@/components/ui/BrandMark';
import Icon from '@/components/ui/Icon';
import { tr } from '@/lib/i18n';
import styles from './Header.module.css';

const nav = [
  { key: 'furniture', href: '/furniture', children: ['sofas', 'beds', 'wardrobes', 'dining-sets', 'study-tables'] },
  { key: 'appliances', href: '/appliances', children: ['refrigerators', 'washing-machines', 'air-conditioners', 'televisions'] },
  { key: 'rooms', href: '/rooms/living', children: ['living', 'bedroom', 'dining', 'study', 'kitchen'] }
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
  const [dynamicNav, setDynamicNav] = useState(nav);
  const [categoryLabels, setCategoryLabels] = useState(labels);

  useEffect(() => {
    setMounted(true);

    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          const furn = json.data.filter((c) => c.type === 'furniture' && c.active);
          const app = json.data.filter((c) => c.type === 'appliance' && c.active);

          const newLabels = { ...labels };
          json.data.forEach((c) => {
            if (c.slug && c.name) {
              newLabels[c.slug] = c.name;
            }
          });
          setCategoryLabels(newLabels);

          setDynamicNav([
            {
              key: 'furniture',
              href: '/furniture',
              children: furn.length > 0 ? furn.map((c) => c.slug) : nav[0].children,
            },
            {
              key: 'appliances',
              href: '/appliances',
              children: app.length > 0 ? app.map((c) => c.slug) : nav[1].children,
            },
            nav[2],
          ]);
        }
      })
      .catch(() => {});
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
        <span>Thoughtful choices for a home that feels like you</span>
        <div className={styles.announceRightGroup}>
          <span className={styles.announceRight}>Delivery · Installation · Aftercare, made clear</span>
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
            <img
              src="/logo.jpeg"
              alt="RF Riddhy Furniture & Appliances"
              width={140}
              height={51}
              priority
              className={styles.logoImg}
            />
          </div>
          {/* <span>
            <b>RF | RIDDHY</b>
            <small>FURNITURE & HOME APPLIANCES</small>
          </span> */}
        </Link>

        <div className={styles.searchWrapper} ref={searchRef}>
          <div className={styles.searchRow}>
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
                Search
              </button>
            </form>

            <div className={styles.miniLogoWrap} aria-hidden="true">
              <Image
                src="/vastu.jpeg"
                alt=""
                fill
                className={styles.miniLogo}
              />
            </div>
          </div>

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
                    Popular searches
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
          <Link href="/consultation" className={styles.consultationBtn}>
            <Icon name="calendar" size={15} />
            <span>Free consultation</span>
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
          {dynamicNav.map((item) => (
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
                      {categoryLabels[slug] || slug.replace(/-/g, ' ')}
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
            Marriage Packages
          </Link>

          <Link
            href="/about"
            className={pathname === '/about' ? styles.active : ''}
            onClick={() => setMenuOpen(false)}
          >
            About 
          </Link>

          <Link
            href="/consultation"
            className={pathname === '/consultation' ? styles.active : ''}
            onClick={() => setMenuOpen(false)}
          >
            Free Consultation
          </Link>
        </div>
      </nav>

      {searchOpen && (
        <form className={styles.mobileSearch} onSubmit={submitSearch}>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the collection"
            aria-label={tr(locale, 'search')}
          />
          <button type="submit">Find it</button>
        </form>
      )}
    </header>
  );
}