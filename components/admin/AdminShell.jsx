'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './AdminShell.module.css';

import {
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Layers,
  Gift,
  Boxes,
  ShieldCheck,
  Megaphone,
  BarChart3,
  Settings,
  Search,
  ExternalLink,
  ArrowUpRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';

/* Lucide Vector Icons */
function NavIcon({ name }) {
  const props = { size: 17, strokeWidth: 1.9 };

  switch (name) {
    case 'overview':
      return <LayoutDashboard {...props} />;
    case 'orders':
      return <ShoppingBag {...props} />;
    case 'leads':
      return <MessageSquare {...props} />;
    case 'catalogue':
      return <Layers {...props} />;
    case 'packages':
      return <Gift {...props} />;
    case 'inventory':
      return <Boxes {...props} />;
    case 'warranty':
      return <ShieldCheck {...props} />;
    case 'campaigns':
      return <Megaphone {...props} />;
    case 'reports':
      return <BarChart3 {...props} />;
    case 'settings':
      return <Settings {...props} />;
    default:
      return null;
  }
}

const NAV_GROUPS = [
  {
    title: 'Operations',
    items: [
      { label: 'Overview', href: '/admin', icon: 'overview' },
      { label: 'Orders & Shipments', href: '/admin/orders', icon: 'orders' },
      { label: 'GST Invoices', href: '/admin/invoices', icon: 'reports' },
      { label: 'Customer Inquiries', href: '/admin/leads', icon: 'leads' }
    ]
  },
  {
    title: 'Catalogue & Stock',
    items: [
      { label: 'Products Catalogue', href: '/admin/catalogue', icon: 'catalogue' },
      { label: 'Merchandising Rails', href: '/admin/merchandising', icon: 'campaigns' },
      { label: 'Marriage Packages', href: '/admin/packages', icon: 'packages', badge: 'Special' },
      { label: 'Inventory & Stock', href: '/admin/inventory', icon: 'inventory' }
    ]
  },
  {
    title: 'Care & Marketing',
    items: [
      { label: 'Warranty & Claims', href: '/admin/warranty', icon: 'warranty', badge: 'Portal' },
      { label: 'CMS & Campaigns', href: '/admin/cms', icon: 'campaigns' },
      { label: 'Business Reports', href: '/admin/reports', icon: 'reports' }
    ]
  },
  {
    title: 'Configuration',
    items: [
      { label: 'Store Settings', href: '/admin/settings', icon: 'settings' }
    ]
  }
];

export default function AdminShell({ children, session }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  if (pathname === '/admin/login') {
    return children;
  }

  const signOut = async () => {
    setBusy(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.replace('/admin/login');
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  if (!session) {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
    return (
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#131b15', color: '#a7baa9', fontFamily: 'sans-serif' }}>
        <p>Redirecting to secure admin sign in…</p>
      </div>
    );
  }

  // Find active label for breadcrumb
  let activePageName = 'Overview';
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.href) {
        activePageName = item.label;
        break;
      }
    }
  }

  return (
    <div className={styles.crmContainer}>
      {/* Mobile Drawer Backdrop */}
      {mobileSidebarOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* LEFT EXECUTIVE SIDEBAR */}
      <aside className={`${styles.sidebar} ${mobileSidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin" className={styles.brand} onClick={() => setMobileSidebarOpen(false)}>
            <div className={styles.brandMark}>RF</div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>RF RIDDHY</span>
              <span className={styles.brandSubtitle}>Operations CRM</span>
            </div>
          </Link>
          <button
            type="button"
            className={styles.closeSidebarBtn}
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className={styles.sidebarNav} aria-label="Admin CRM navigation">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className={styles.navGroup}>
              <div className={styles.groupTitle}>{group.title}</div>
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                    onClick={() => setMobileSidebarOpen(false)}
                  >
                    <div className={styles.navLinkLeft}>
                      <span className={styles.navIcon}>
                        <NavIcon name={item.icon} />
                      </span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer: Profile & Logout */}
        <div className={styles.sidebarFooter}>
          <div className={styles.adminProfile}>
            <div className={styles.avatar}>
              {(session?.name || session?.email || 'AD').slice(0, 2).toUpperCase()}
            </div>
            <div className={styles.profileInfo}>
              <b>{session?.name || 'Store Administrator'}</b>
              <span>{session?.role ? `${session.role} · Live` : 'Admin · Live'}</span>
            </div>
          </div>

          <div className={styles.sidebarActionBtns}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.storeLinkBtn}
              title="View live store in new tab"
            >
              <span>Store</span>
              <ArrowUpRight size={13} />
            </a>
            <button
              type="button"
              className={styles.signOutBtn}
              disabled={busy}
              onClick={signOut}
              title="Sign out of administration"
            >
              {busy ? '...' : 'Sign out'}
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <div className={styles.contentArea}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button
              type="button"
              className={styles.mobileToggleBtn}
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open sidebar menu"
            >
              <Menu size={18} />
            </button>

            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/admin">CRM</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbActive}>{activePageName}</span>
            </nav>
          </div>

          {/* Search Bar */}
          <div className={styles.quickSearch}>
            <Search size={14} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search catalogue, orders, inquiries..."
              aria-label="Quick search"
              readOnly
              onClick={() => router.push('/admin/catalogue')}
            />
            <kbd className={styles.quickSearchKbd}>⌘K</kbd>
          </div>

          <div className={styles.topbarRight}>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.topbarStoreLink}
              title="View live store in new tab"
            >
              <span>View Store</span>
              <ExternalLink size={12} strokeWidth={2} />
            </a>

            <button
              type="button"
              className={styles.signOutBtn}
              style={{ padding: '5px 12px', borderRadius: '999px', fontSize: '11px' }}
              disabled={busy}
              onClick={signOut}
            >
              {busy ? '...' : 'Sign out'}
            </button>
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main className={styles.main}>
          {children}
        </main>
      </div>
    </div>
  );
}
