'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setCartDrawer } from '@/store/uiSlice';
import { formatINR } from '@/lib/demo-data';
import { getLocalizedProductName, getLocalizedCategoryName } from '@/lib/translate-backend';
import Icon from '@/components/ui/Icon';
import { siteConfig } from '@/lib/site-config';
import { tr } from '@/lib/i18n';
import styles from './Header.module.css';

const nav = [
  {
    key: 'furniture',
    href: '/furniture',
    children: [
      'double-bed',
      'sringardan',
      'sofa-set',
      'centre-table',
      'wooden-wordrobe',
      'almirah',
      'fancy-almirah',
      'mattress',
      'rajai',
      'blanket',
      'pillow',
      'bedsheet',
      'pillow-cover',
      'parda',
      'namaz-chauki',
      'plastic-table',
      'plastic-chairs',
      'baxa',
      'peti',
      'trolley-bag'
    ]
  },
  {
    key: 'appliances',
    href: '/appliances',
    children: [
      'washing-machine',
      'fridge',
      'cooler',
      'diacut-cooler',
      'mixer',
      'juicer',
      'iron',
      'gas-chulha',
      'utensils-washer',
      'roti-maker'
    ]
  },
  {
    key: 'utensils',
    href: '/utensils',
    children: [
      'dinner-set',
      'pressure-cooker',
      'kadai-frypan',
      'roti-tawa',
      'thali-set',
      'water-jug',
      'masala-dabba',
      'casserole-set',
      'bhagona-set',
      'cutlery-set',
      'water-dispenser',
      'tea-milk-pot'
    ]
  },
  { key: 'rooms', href: '/rooms/living', children: ['living', 'bedroom', 'dining', 'study', 'kitchen'] }
];

const labels = {
  // Furniture
  'double-bed': 'Double Bed',
  sringardan: 'Sringardan',
  'sofa-set': 'Sofa Set',
  'centre-table': 'Centre Table',
  'wooden-wordrobe': 'Wooden Wardrobe',
  almirah: 'Almirah (Steel)',
  'fancy-almirah': 'Fancy Almirah',
  mattress: 'Mattress',
  rajai: 'Rajai (Quilt)',
  blanket: 'Blanket',
  pillow: 'Pillow',
  bedsheet: 'Bedsheet',
  'pillow-cover': 'Pillow Cover',
  parda: 'Parda (Curtains)',
  'namaz-chauki': 'Namaz Chauki',
  'plastic-table': 'Plastic Table',
  'plastic-chairs': 'Plastic Chairs',
  baxa: 'Baxa (Trunk)',
  peti: 'Peti (Storage)',
  'trolley-bag': 'Trolley Bag',
  sofas: 'Sofas & Seating',
  beds: 'Beds',
  wardrobes: 'Wardrobes',
  'dining-sets': 'Dining Sets',
  'study-tables': 'Study & Work',
  mattresses: 'Mattresses',

  // Appliances
  'washing-machine': 'Washing Machine',
  fridge: 'Fridge',
  cooler: 'Cooler',
  'diacut-cooler': 'Diacut Cooler',
  mixer: 'Mixer Grinder',
  juicer: 'Juicer & Blender',
  iron: 'Iron (Press)',
  'gas-chulha': 'Gas Chulha',
  'utensils-washer': 'Utensils Washer',
  'roti-maker': 'Roti Maker',
  refrigerators: 'Refrigerators',
  'washing-machines': 'Washing Machines',
  'air-conditioners': 'Air Conditioners',
  televisions: 'Televisions',

  // Utensils
  'dinner-set': 'Dinner Set',
  'pressure-cooker': 'Pressure Cooker',
  'kadai-frypan': 'Kadai & Fry Pan',
  'roti-tawa': 'Roti Tawa',
  'thali-set': 'Thali Set',
  'water-jug': 'Water Jug & Glasses',
  'masala-dabba': 'Masala Dabba',
  'casserole-set': 'Hotpot Casserole',
  'bhagona-set': 'Bhagona & Tope Set',
  'cutlery-set': 'Cutlery & Spoon Stand',
  'water-dispenser': 'Water Dispenser',
  'tea-milk-pot': 'Tea & Milk Pot',

  // Rooms
  living: 'Living room',
  bedroom: 'Bedroom',
  dining: 'Dining',
  study: 'Study',
  kitchen: 'Kitchen & utility'
};

const furnitureGrid = [
  { slug: 'double-bed', label: 'Double Bed', icon: 'bed', href: '/furniture/double-bed', desc: 'Hydraulic Storage & King Size' },
  { slug: 'sringardan', label: 'Sringardan', icon: 'sparkles', href: '/furniture/sringardan', desc: 'Dressing Vanity with Mirror' },
  { slug: 'sofa-set', label: 'Sofa Set', icon: 'sofa', href: '/furniture/sofa-set', desc: '5-Seater Royal Living Sets' },
  { slug: 'centre-table', label: 'Centre Table', icon: 'sliders', href: '/furniture/centre-table', desc: 'Sheesham & Glass Top Tables' },
  { slug: 'wooden-wordrobe', label: 'Wooden Wardrobe', icon: 'layers', href: '/furniture/wooden-wordrobe', desc: 'Sliding & 4-Door Teak Wood' },
  { slug: 'almirah', label: 'Steel Almirah', icon: 'shield', href: '/furniture/almirah', desc: 'Triveni Gold Heavy Gauge' },
  { slug: 'all-furniture', label: 'All Furniture', icon: 'arrow', href: '/furniture', desc: 'Explore Complete 20 Categories' }
];

const appliancesGrid = [
  { slug: 'washing-machine', label: 'Washing Machine', icon: 'washer', href: '/appliances/washing-machine', desc: 'Inverter Front & Top Load' },
  { slug: 'fridge', label: 'Fridge', icon: 'refrigerator', href: '/appliances/fridge', desc: 'Double Door Frost-Free' },
  { slug: 'cooler', label: 'Desert Cooler', icon: 'wind', href: '/appliances/cooler', desc: '70L High Air Throw Blower' },
  { slug: 'diacut-cooler', label: 'Diacut Cooler', icon: 'wind', href: '/appliances/diacut-cooler', desc: 'Heavy Galvanized Metal Body' },
  { slug: 'mixer', label: 'Mixer Grinder', icon: 'sparkles', href: '/appliances/mixer', desc: 'Heavy Duty 3 & 4 Jars' },
  { slug: 'gas-chulha', label: 'Gas Chulha', icon: 'flame', href: '/appliances/gas-chulha', desc: 'Toughened Glass 3-Burner' },
  { slug: 'all-appliances', label: 'All Appliances', icon: 'arrow', href: '/appliances', desc: 'View Full Appliance Suite' }
];

const utensilsGrid = [
  { slug: 'dinner-set', label: 'Dinner Sets', icon: 'sparkles', href: '/utensils/dinner-set', desc: '51 & 61-Piece Heavy SS Sets' },
  { slug: 'pressure-cooker', label: 'Pressure Cookers', icon: 'layers', href: '/utensils/pressure-cooker', desc: 'Hawkins & Prestige Induction' },
  { slug: 'kadai-frypan', label: 'Kadai & Fry Pan', icon: 'sliders', href: '/utensils/kadai-frypan', desc: 'Tri-Ply Heavy Bottom Duo' },
  { slug: 'thali-set', label: 'Thali & Katori Sets', icon: 'sparkles', href: '/utensils/thali-set', desc: 'Royal Maharaja Family Sets' },
  { slug: 'casserole-set', label: 'Hotpot Casseroles', icon: 'shield', href: '/utensils/casserole-set', desc: 'Insulated Thermal Keep-Warm' },
  { slug: 'all-utensils', label: 'All Utensils', icon: 'arrow', href: '/utensils', desc: 'View Full Utensils Collection' }
];

const roomLinks = [
  { slug: 'living', label: 'Living Room', href: '/rooms/living' },
  { slug: 'bedroom', label: 'Bedroom', href: '/rooms/bedroom' },
  { slug: 'dining', label: 'Dining Room', href: '/rooms/dining' },
  { slug: 'study', label: 'Study Room', href: '/rooms/study' },
  { slug: 'kitchen', label: 'Kitchen & Utility', href: '/rooms/kitchen' }
];

const servicesLinks = [
  { label: 'Free Consultation', href: '/consultation', icon: 'calendar', highlight: true },
  { label: 'Our Packages', href: '/packages', icon: 'crown', highlight: true },
  { label: 'Track Order', href: '/track-order', icon: 'truck' },
  { label: '5-Yr Warranty', href: '/warranty', icon: 'shield' },
  { label: 'About Riddhy', href: '/about', icon: 'info' },
  { label: 'My Account', href: '/account', icon: 'user' },
  { label: 'Saved Wishlist', href: '/wishlist', icon: 'heart' },
  { label: 'Store Visit', href: '/contact', icon: 'mapPin' }
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();

  const cartCount = useSelector((state) =>
    state.auth?.isAuthenticated ? state.cart.items.reduce((sum, item) => sum + item.qty, 0) : 0
  );
  const wishlistCount = useSelector((state) =>
    state.auth?.isAuthenticated ? state.wishlist.items.length : 0
  );
  const locale = useSelector((state) => state.ui.locale);

  const [mounted, setMounted] = useState(false);
  const [dynamicNav, setDynamicNav] = useState(nav);
  const [categoryLabels, setCategoryLabels] = useState(labels);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef(null);
  const mobileInputRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Contact configurations
  const phoneDisplay = siteConfig.contact?.phone || '+91 99342 08035';
  const phoneRaw = phoneDisplay.replace(/[^0-9+]/g, '');
  const whatsappDisplay = siteConfig.contact?.whatsapp || '+91 99342 08035';
  const whatsappDigits = whatsappDisplay.replace(/[^0-9]/g, '') || '919934208035';
  const emailDisplay = siteConfig.contact?.email || 'care@riddhy.in';
  const addressDisplay = siteConfig.showroom?.addressLine1
    ? `${siteConfig.showroom.addressLine1}, ${siteConfig.showroom.city || 'Prayagraj'}`
    : 'Civil Lines, Prayagraj, UP (Opp. High Court)';

  const announcementItems = [
    {
      icon: 'phone',
      prefix: 'Call Us:',
      text: phoneDisplay,
      href: `tel:${phoneRaw}`,
      external: false
    },
    {
      icon: 'whatsapp',
      prefix: 'WhatsApp:',
      text: `${whatsappDisplay} (Quick Chat)`,
      href: `https://wa.me/${whatsappDigits}?text=Hello%20RF%20Riddhy%2C%20I%20want%20to%20inquire%20about%20your%20collection`,
      external: true
    },
    {
      icon: 'mail',
      prefix: 'Email:',
      text: emailDisplay,
      href: `mailto:${emailDisplay}`,
      external: false
    },
    {
      icon: 'mapPin',
      prefix: 'Store & Hub:',
      text: addressDisplay,
      href: '/contact',
      external: false
    },
    {
      icon: 'truck',
      prefix: 'Delivery:',
      text: 'Free Express Delivery & White-Glove Setup in Prayagraj',
      href: '/policies/shipping',
      external: false
    },
    {
      icon: 'shield',
      prefix: 'Warranty:',
      text: '5-Year Structural Timber & Appliance Assurance',
      href: '/warranty',
      external: false
    },
    {
      icon: 'crown',
      prefix: 'Showroom Deals:',
      text: 'All 5 of Our Packages Live · Save Up to 40%',
      href: '/packages',
      external: false
    }
  ];

  // Helper to close slide menu
  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  // Auto-close menu on route changes
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
    setSearchFocused(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setSearchOpen(false);
        setSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    setMounted(true);

    fetch('/api/categories')
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json?.success && Array.isArray(json?.data) && json.data.length > 0) {
          const legacyAliases = new Set([
            'sofas', 'beds', 'wardrobes', 'dining-sets', 'study-tables', 'mattresses', 'decor', 'storage',
            'refrigerators', 'washing-machines', 'air-conditioners', 'televisions', 'microwaves', 'chimneys', 'water-purifiers'
          ]);
          const furn = json.data.filter((c) => c.type === 'furniture' && c.active && !legacyAliases.has(c.slug));
          const app = json.data.filter((c) => c.type === 'appliance' && c.active && !legacyAliases.has(c.slug));

          const uten = json.data.filter((c) => c.type === 'utensils' && c.active && !legacyAliases.has(c.slug));

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
              children: furn.length > 0 ? furn.map((c) => c.slug) : nav[0].children
            },
            {
              key: 'appliances',
              href: '/appliances',
              children: app.length > 0 ? app.map((c) => c.slug) : nav[1].children
            },
            {
              key: 'utensils',
              href: '/utensils',
              children: uten.length > 0 ? uten.map((c) => c.slug) : nav[2].children
            },
            nav[3]
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const displayCartCount = mounted ? cartCount : 0;
  const displayWishlistCount = mounted ? wishlistCount : 0;

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

  // Click outside to close live search dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Auto-focus mobile search input when opened
  useEffect(() => {
    if (searchOpen) {
      const timer = setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [searchOpen]);

  // Click outside to close mobile search
  useEffect(() => {
    const handleOutsideMobileClick = (e) => {
      if (
        searchOpen &&
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(e.target) &&
        !e.target.closest?.(`.${styles.searchToggle}`)
      ) {
        setSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideMobileClick);
    document.addEventListener('touchstart', handleOutsideMobileClick, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleOutsideMobileClick);
      document.removeEventListener('touchstart', handleOutsideMobileClick);
    };
  }, [searchOpen]);

  const submitSearch = (event) => {
    event.preventDefault();
    const term = query.trim();
    if (term) {
      router.push(`/search?q=${encodeURIComponent(term)}`);
      setSearchFocused(false);
      setSearchOpen(false);
      closeMenu();
    }
  };

  return (
    <header className={styles.header}>
      {/* Moving Announcement Bar with Phone, Email, WhatsApp, Address & Icons */}
      <div className={styles.announcementBar}>
        <div className={styles.marqueeTrack}>
          {/* Main sequence */}
          <div className={styles.marqueeGroup}>
            {announcementItems.map((item, idx) => (
              <a
                key={`m1-${idx}`}
                href={item.href}
                className={styles.marqueeItem}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                <span className={styles.marqueeIconWrap}>
                  <Icon name={item.icon} size={13} />
                </span>
                <span className={styles.marqueeLabel}>
                  {item.prefix && <strong className={styles.marqueePrefix}>{item.prefix}</strong>}
                  <span>{item.text}</span>
                </span>
                <span className={styles.marqueeBullet} aria-hidden="true">
                  ✦
                </span>
              </a>
            ))}
          </div>

          {/* Duplicated sequence for endless seamless loop */}
          <div className={styles.marqueeGroup} aria-hidden="true">
            {announcementItems.map((item, idx) => (
              <a
                key={`m2-${idx}`}
                href={item.href}
                className={styles.marqueeItem}
                tabIndex={-1}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
              >
                <span className={styles.marqueeIconWrap}>
                  <Icon name={item.icon} size={13} />
                </span>
                <span className={styles.marqueeLabel}>
                  {item.prefix && <strong className={styles.marqueePrefix}>{item.prefix}</strong>}
                  <span>{item.text}</span>
                </span>
                <span className={styles.marqueeBullet} aria-hidden="true">
                  ✦
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Main Header Row */}
      <div className={styles.mainRow}>
        {/* Left Group: Hamburger Menu Button + Clean Logo PNG */}
        <div className={styles.leftGroup}>
          <button
            className={styles.hamburgerBtn}
            type="button"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span className={styles.hamburgerIconWrap}>
              <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
            </span>
            <span className={styles.hamburgerText}>Menu</span>
          </button>

          {/* Logo WITHOUT any background, WITHOUT any border, ONLY logo PNG */}
          <Link href="/" className={styles.brand} aria-label="RF Riddhy home" onClick={closeMenu}>
            <Image
              src="/logo.png"
              alt="RF Riddhy Furniture & Appliances"
              width={140}
              height={50}
              priority
              className={styles.brandLogo}
            />
          </Link>
        </div>

        {/* Desktop Live Search Bar */}
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
                    {['Sofas', 'Storage Beds', 'Refrigerators', 'Dining Sets', 'Our Packages'].map((term) => (
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

        {/* Right Header Action Icons */}
        <div className={styles.actions}>
          <Link href="/consultation" className={styles.consultationBtn}>
            <Icon name="calendar" size={15} />
            <span>Free consultation</span>
          </Link>

          <button
            type="button"
            className={styles.searchToggle}
            aria-label="Toggle mobile search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Icon name={searchOpen ? 'close' : 'search'} size={21} />
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

      {/* Mobile Search Input Drawer (When Search Icon is toggled) */}
      {searchOpen && (
        <div className={styles.mobileSearchContainer} ref={mobileSearchRef}>
          <form className={styles.mobileSearchForm} onSubmit={submitSearch} role="search">
            <div className={styles.mobileSearchInputWrap}>
              <Icon name="search" size={17} className={styles.mobileSearchIcon} />
              <input
                ref={mobileInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sofas, beds, appliances, packages…"
                aria-label={tr(locale, 'search')}
                className={styles.mobileSearchInput}
              />
              {query.length > 0 && (
                <button
                  type="button"
                  className={styles.mobileSearchClearBtn}
                  onClick={() => setQuery('')}
                  aria-label="Clear query"
                >
                  <Icon name="close" size={13} />
                </button>
              )}
            </div>
            <button type="submit" className={styles.mobileSearchSubmitBtn}>
              Search
            </button>
          </form>

          {/* Mobile Live Search Dropdown */}
          <div className={styles.mobileSearchDropdown}>
            {query.trim().length >= 2 ? (
              <div className={styles.mobileSearchResultsList}>
                <div className={styles.mobileSearchHeader}>
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
                      className={styles.mobileSearchResultItem}
                      onClick={() => {
                        setSearchOpen(false);
                        setQuery('');
                      }}
                    >
                      <div className={styles.mobileSearchThumb}>
                        <img src={thumb} alt={item.name} />
                      </div>
                      <div className={styles.mobileSearchInfo}>
                        <span className={styles.mobileSearchTitle}>
                          {getLocalizedProductName(item, locale)}
                        </span>
                        <span className={styles.mobileSearchCat}>
                          {getLocalizedCategoryName(item.categoryLabel || item.category, locale)}
                        </span>
                      </div>
                      <span className={styles.mobileSearchPrice}>
                        {formatINR(item.price)}
                      </span>
                    </Link>
                  );
                })}

                <button
                  type="button"
                  className={styles.mobileSearchViewAll}
                  onClick={submitSearch}
                >
                  <span>View all results for &ldquo;{query}&rdquo;</span>
                  <Icon name="arrow" size={13} />
                </button>
              </div>
            ) : (
              <div className={styles.mobileSearchTrendingBox}>
                <div className={styles.mobileSearchHeader}>
                  <Icon name="sparkles" size={12} />
                  <span>Popular in Prayagraj</span>
                </div>
                <div className={styles.mobileTrendingChips}>
                  {['Sofas', 'Storage Beds', 'Refrigerators', 'Dining Sets', 'Our Packages', 'Air Conditioners'].map(
                    (term) => (
                      <button
                        type="button"
                        key={term}
                        className={styles.mobileTrendingChip}
                        onClick={() => {
                          setQuery(term);
                          router.push(`/search?q=${encodeURIComponent(term)}`);
                          setSearchOpen(false);
                        }}
                      >
                        <Icon name="search" size={11} />
                        <span>{term}</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop Main Navigation Bar */}
      <nav className={styles.desktopNav} aria-label="Main desktop navigation">
        <div className={styles.navInner}>
          {dynamicNav.map((item) => (
            <div 
              className={styles.navItem} 
              key={item.href}
              onMouseEnter={() => setActiveDropdown(item.key)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <Link
                className={pathname === item.href ? styles.active : ''}
                href={item.href}
                onClick={() => setActiveDropdown(null)}
              >
                {tr(locale, item.key)}
              </Link>
              {item.children && activeDropdown === item.key && (
                <div className={`${styles.dropdown} ${item.key === 'rooms' ? styles.dropdownRooms : ''}`}>
                  <div className={styles.dropdownGrid}>
                    {item.children.map((slug) => (
                      <Link
                        key={slug}
                        href={item.href.startsWith('/rooms') ? `/rooms/${slug}` : `${item.href}/${slug}`}
                        className={styles.dropdownLink}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <span className={styles.dropdownBullet}></span>
                        <span className={styles.dropdownText}>{categoryLabels[slug] || slug.replace(/-/g, ' ')}</span>
                      </Link>
                    ))}
                  </div>
                  <div className={styles.dropdownFooter}>
                    <Link 
                      href={item.href} 
                      className={styles.viewAllLink}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <span>Explore all {item.key === 'furniture' ? 'furnitures' : item.key === 'rooms' ? 'rooms' : item.key}</span>
                      <Icon name="arrow" size={12} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}

          <Link
            href="/packages"
            className={pathname === '/packages' || pathname === '/marriage-packages' ? styles.active : ''}
          >
            <span className={styles.offerBadge}>Exclusive</span>
            Our Packages
          </Link>

          <Link
            href="/about"
            className={pathname === '/about' ? styles.active : ''}
          >
            About
          </Link>

          <Link
            href="/consultation"
            className={pathname === '/consultation' ? styles.active : ''}
          >
            Free Consultation
          </Link>
        </div>
      </nav>

      {/* Mobile Fancy Animated Slide Menu Drawer */}
      <div
        className={`${styles.drawerBackdrop} ${menuOpen ? styles.drawerBackdropOpen : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      <aside
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-label="Navigation drawer"
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.drawerInner}>
          {/* Top of drawer: Clean Logo PNG without background/border + Close button */}
          <div className={styles.drawerHeader}>
            <Link href="/" onClick={closeMenu} className={styles.drawerBrand} aria-label="RF Riddhy home">
              <Image
                src="/logo.png"
                alt="RF Riddhy Furniture & Appliances"
                width={125}
                height={45}
                className={styles.drawerLogoImg}
              />
            </Link>

            <button
              type="button"
              className={styles.drawerCloseBtn}
              onClick={closeMenu}
              aria-label="Close navigation menu"
            >
              <Icon name="close" size={20} />
            </button>
          </div>

          {/* Showroom Location Pill */}
          <div className={styles.drawerLocationStrip}>
            <span className={styles.drawerLocationPulse} />
            <span>Civil Lines Showroom · Prayagraj</span>
          </div>

          {/* Drawer Quick Search */}
          <form className={styles.drawerSearch} onSubmit={submitSearch}>
            <Icon name="search" size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search beds, sofas, packages…"
              aria-label="Search collection"
            />
            <button type="submit" aria-label="Search">
              <Icon name="arrow" size={14} />
            </button>
          </form>

          {/* Scrollable Categories in Grids (Text Only, Fancy Animated) */}
          <div className={styles.drawerScrollArea}>
            {/* VIP Card: Our Packages (Text Only) */}
            <Link href="/packages" onClick={closeMenu} className={styles.drawerFestiveCard}>
              <div className={styles.festiveGlow} aria-hidden="true" />
              <div className={styles.drawerFestiveBadge}>
                <span>Wedding Festive Sale</span>
              </div>
              <strong className={styles.drawerFestiveTitle}>
                Our Packages (Furniture & Appliance Combos)
              </strong>
              <p className={styles.drawerFestiveDesc}>
                Complete 5 all-inclusive packages: Shagun, Lagan, Kanyadaan, Griha Lakshmi & Bhagya Shree.
              </p>
              <div className={styles.drawerFestiveCta}>
                <span>Explore Our Packages →</span>
              </div>
            </Link>

            {/* Grid 1: Handcrafted Furniture (Text Only in Grids) */}
            <div className={styles.drawerSection}>
              <div className={styles.drawerSectionHeader}>
                <span className={styles.drawerSectionTitle}>Furniture Collections</span>
                <Link href="/furniture" onClick={closeMenu} className={styles.drawerSectionAllLink}>
                  <span>View All →</span>
                </Link>
              </div>

              <div className={styles.categoryGrid}>
                {furnitureGrid.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.href}
                    onClick={closeMenu}
                    className={styles.categoryCard}
                  >
                    <div className={styles.cardContent}>
                      <span className={styles.cardTitle}>{item.label}</span>
                      <span className={styles.cardDesc}>{item.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Grid 2: Smart Home Appliances (Text Only in Grids) */}
            <div className={styles.drawerSection}>
              <div className={styles.drawerSectionHeader}>
                <span className={styles.drawerSectionTitle}>Home Appliances</span>
                <Link href="/appliances" onClick={closeMenu} className={styles.drawerSectionAllLink}>
                  <span>View All →</span>
                </Link>
              </div>

              <div className={styles.categoryGrid}>
                {appliancesGrid.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.href}
                    onClick={closeMenu}
                    className={styles.categoryCard}
                  >
                    <div className={styles.cardContent}>
                      <span className={styles.cardTitle}>{item.label}</span>
                      <span className={styles.cardDesc}>{item.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Grid 3: Utensils & Kitchenware */}
            <div className={styles.drawerSection}>
              <div className={styles.drawerSectionHeader}>
                <span className={styles.drawerSectionTitle}>Utensils & Kitchenware</span>
                <Link href="/utensils" onClick={closeMenu} className={styles.drawerSectionAllLink}>
                  <span>View All →</span>
                </Link>
              </div>

              <div className={styles.categoryGrid}>
                {utensilsGrid.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.href}
                    onClick={closeMenu}
                    className={styles.categoryCard}
                  >
                    <div className={styles.cardContent}>
                      <span className={styles.cardTitle}>{item.label}</span>
                      <span className={styles.cardDesc}>{item.desc}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Grid 4: Shop by Room (Text Only in Grids) */}
            <div className={styles.drawerSection}>
              <div className={styles.drawerSectionHeader}>
                <span className={styles.drawerSectionTitle}>Curated by Room</span>
              </div>

              <div className={styles.roomGrid}>
                {roomLinks.map((item) => (
                  <Link
                    key={item.slug}
                    href={item.href}
                    onClick={closeMenu}
                    className={styles.roomCard}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Grid 4: Services & Quick Links (Text Only in Grids) */}
            <div className={styles.drawerSection}>
              <div className={styles.drawerSectionHeader}>
                <span className={styles.drawerSectionTitle}>Services & Support</span>
              </div>

              <div className={styles.servicesGrid}>
                {servicesLinks.map((item, idx) => (
                  <Link
                    key={idx}
                    href={item.href}
                    onClick={closeMenu}
                    className={`${styles.serviceCard} ${item.highlight ? styles.serviceCardHighlight : ''}`}
                  >
                    <span>{item.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Direct Prayagraj Helplines & Contact Box (Text Only in Grids) */}
            <div className={styles.drawerContactBox}>
              <div className={styles.drawerContactHeader}>
                <strong>Direct Prayagraj Helplines</strong>
              </div>
              <p className={styles.drawerContactSub}>
                Have a question or custom dimension requirement? Connect instantly.
              </p>

              <div className={styles.drawerContactRow}>
                <a
                  href={`tel:${phoneRaw}`}
                  onClick={closeMenu}
                  className={`${styles.contactActionBtn} ${styles.callBtn}`}
                >
                  <span>Call Us</span>
                </a>

                <a
                  href={`https://wa.me/${whatsappDigits}?text=Hello%20RF%20Riddhy%2C%20I%20want%20to%20inquire%20about%20your%20collection`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className={`${styles.contactActionBtn} ${styles.whatsappBtn}`}
                >
                  <span>WhatsApp</span>
                </a>

                <Link
                  href="/contact"
                  onClick={closeMenu}
                  className={`${styles.contactActionBtn} ${styles.storeBtn}`}
                >
                  <span>Showroom</span>
                </Link>
              </div>

              <a
                href={`mailto:${emailDisplay}`}
                onClick={closeMenu}
                className={styles.drawerEmailLink}
              >
                <span>Email: {emailDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </header>
  );
}