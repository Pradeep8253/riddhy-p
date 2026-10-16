'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
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
  const cartCount = useSelector((state) => state.cart.items.reduce((sum, item) => sum + item.qty, 0));
  const wishlistCount = useSelector((state) => state.wishlist.items.length);
  const locale = useSelector((state) => state.ui.locale);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <header className={styles.header}>
      <div className={styles.announcement}>
        <span>{locale === 'hi' ? 'आपके घर के लिए सोच-समझकर चुनी चीज़ें' : 'Thoughtful choices for a home that feels like you'}</span>
        <span className={styles.announceRight}>{locale === 'hi' ? 'डिलीवरी · इंस्टॉलेशन · देखभाल' : 'Delivery · Installation · Aftercare, made clear'}</span>
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
          <BrandMark size={50} />
          <span>
            <b>RF | RIDDHY</b>
            <small>FURNITURE & HOME APPLIANCES</small>
          </span>
        </Link>

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
            placeholder={tr(locale, 'search')}
          />
          <button type="submit" aria-label="Submit search">
            {locale === 'hi' ? 'खोजें' : 'Search'}
          </button>
        </form>

        <div className={styles.actions}>
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
            aria-label={`${tr(locale, 'wishlist')}${wishlistCount ? `, ${wishlistCount} items` : ''}`}
          >
            <Icon name="heart" size={21} />
            {wishlistCount > 0 && <i>{wishlistCount}</i>}
          </Link>

          <Link href="/account" className={styles.iconLink} aria-label={tr(locale, 'account')}>
            <Icon name="user" size={21} />
          </Link>

          <Link
            href="/cart"
            className={`${styles.iconLink} ${styles.bag}`}
            aria-label={`${tr(locale, 'bag')}${cartCount ? `, ${cartCount} items` : ''}`}
          >
            <Icon name="bag" size={21} />
            <span>{tr(locale, 'bag')}</span>
            {cartCount > 0 && <i>{cartCount}</i>}
          </Link>
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
            href="/warranty"
            className={pathname === '/warranty' ? styles.active : ''}
            onClick={() => setMenuOpen(false)}
          >
            {locale === 'hi' ? 'वारंटी' : 'Warranty'}
          </Link>

          <Link
            href="/contact"
            className={pathname === '/contact' ? styles.active : ''}
            onClick={() => setMenuOpen(false)}
          >
            {tr(locale, 'contact')}
          </Link>

          <Link
            href="/bulk-enquiry"
            className={pathname === '/bulk-enquiry' ? styles.active : ''}
            onClick={() => setMenuOpen(false)}
          >
            {tr(locale, 'trade')}
          </Link>

          {/* Mobile menu CTA */}
          <Link
            href="/consultation"
            className={styles.mobileConsultationBtn}
            onClick={() => setMenuOpen(false)}
          >
            <Icon name="calendar" size={16} />
            <span>{tr(locale, 'freeConsultation')}</span>
          </Link>
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
