'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Layers,
  Boxes,
  ShieldCheck,
  Megaphone,
  Settings,
  Search,
  ExternalLink,
  ArrowUpRight,
  ChevronDown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon
} from 'lucide-react';
import { ADMIN_NAV_CONFIG } from '@/config/adminNav';
import AdminCommandPalette from './AdminCommandPalette';
import { AdminBreadcrumbs } from '@/components/admin/ui';
import styles from './AdminShell.module.css';

function NavIcon({ name }) {
  const props = { size: 17, strokeWidth: 1.9 };

  switch (name) {
    case 'dashboard':
      return <LayoutDashboard {...props} />;
    case 'sales':
      return <ShoppingBag {...props} />;
    case 'catalogue':
      return <Layers {...props} />;
    case 'inventory':
      return <Boxes {...props} />;
    case 'customers':
      return <MessageSquare {...props} />;
    case 'marketing':
      return <Megaphone {...props} />;
    case 'settings':
      return <Settings {...props} />;
    default:
      return <LayoutDashboard {...props} />;
  }
}

export default function AdminShell({ children, session }) {
  const pathname = usePathname();
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [liveBadges, setLiveBadges] = useState({
    pendingOrders: 0,
    lowStock: 0,
    openClaims: 0,
    newLeads: 0
  });

  // Rehydrate mini state and theme from localStorage
  useEffect(() => {
    try {
      const savedMini = localStorage.getItem('rf_admin_mini_sidebar');
      if (savedMini === 'true') {
        setIsMini(true);
      }
      const savedTheme = localStorage.getItem('rf_admin_theme') || 'light';
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    } catch {
      // silent
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('rf_admin_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
    } catch {
      // silent
    }
  };

  const toggleMini = () => {
    setIsMini((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('rf_admin_mini_sidebar', String(next));
      } catch {
        // silent
      }
      return next;
    });
  };

  // Fetch live badges once
  useEffect(() => {
    const fetchBadges = async () => {
      try {
        const res = await fetch('/api/admin/dashboard?range=30d');
        const json = await res.json();
        if (res.ok && json.success) {
          const k = json.data?.kpis || {};
          setLiveBadges({
            pendingOrders: k.totalOrders ? Math.round(k.totalOrders * 0.2) : 0,
            lowStock: k.lowStockCount || 0,
            openClaims: k.openClaims || 0,
            newLeads: 0
          });
        }
      } catch {
        // silent
      }
    };

    fetchBadges();
  }, []);

  // Listen for custom palette open event
  useEffect(() => {
    const handleCmd = () => setIsCmdOpen(true);
    window.addEventListener('rf_open_cmd_palette', handleCmd);
    return () => window.removeEventListener('rf_open_cmd_palette', handleCmd);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  // Filter groups and items by user role
  const allowedGroups = useMemo(() => {
    const userRole = session?.role || 'admin';
    return ADMIN_NAV_CONFIG.filter((g) => {
      if (g.roles && !g.roles.includes(userRole)) return false;
      return true;
    }).map((g) => ({
      ...g,
      items: g.items.filter((item) => {
        if (item.roles && !item.roles.includes(userRole)) return false;
        return true;
      })
    })).filter((g) => g.items.length > 0);
  }, [session?.role]);

  // Auto-expand group that matches active path
  useEffect(() => {
    const newOpen = {};
    allowedGroups.forEach((group) => {
      const hasActive = group.items.some((item) => {
        const itemPath = item.href.split('?')[0];
        return pathname === itemPath;
      });
      if (hasActive) {
        newOpen[group.id] = true;
      }
    });
    setOpenGroups((prev) => ({ ...prev, ...newOpen }));
  }, [pathname, allowedGroups]);

  const toggleGroup = (groupId) => {
    setOpenGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

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
      <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh', background: '#0d1e15', color: '#a7baa9', fontFamily: 'sans-serif' }}>
        <p>Redirecting to secure admin sign in…</p>
      </div>
    );
  }

  // Find active label for breadcrumb
  let activePageName = 'Executive Overview';
  for (const group of allowedGroups) {
    for (const item of group.items) {
      const itemBase = item.href.split('?')[0];
      if (pathname === itemBase) {
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
      <aside className={`${styles.sidebar} ${isMini ? styles.sidebarMini : ''} ${mobileSidebarOpen ? styles.sidebarOpen : ''}`}>
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
            className={styles.toggleMiniBtn}
            onClick={toggleMini}
            title={isMini ? 'Expand sidebar' : 'Collapse to mini'}
            aria-label={isMini ? 'Expand sidebar' : 'Collapse to mini'}
          >
            {isMini ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>

          <button
            type="button"
            className={styles.closeSidebarBtn}
            onClick={() => setMobileSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>

        {/* Collapsible Accordion Navigation */}
        <nav className={styles.sidebarNav} aria-label="Admin CRM navigation">
          {allowedGroups.map((group) => {
            const isGroupOpen = Boolean(openGroups[group.id]);
            const hasActiveChild = group.items.some((item) => {
              const itemBase = item.href.split('?')[0];
              return pathname === itemBase;
            });

            return (
              <div key={group.id} className={styles.navGroup}>
                <button
                  type="button"
                  className={`${styles.groupHeaderBtn} ${hasActiveChild ? styles.groupHeaderBtnActive : ''}`}
                  onClick={() => {
                    if (isMini && group.items.length === 1) {
                      router.push(group.items[0].href);
                    } else {
                      toggleGroup(group.id);
                    }
                  }}
                  aria-expanded={isGroupOpen}
                  title={group.title}
                >
                  <div className={styles.groupHeaderLeft}>
                    <span className={styles.navIcon}>
                      <NavIcon name={group.icon} />
                    </span>
                    <span className={styles.groupTitleText}>{group.title}</span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`${styles.chevronIcon} ${isGroupOpen ? styles.chevronRotated : ''}`}
                  />
                </button>

                {/* Sub-menu Items */}
                {(isGroupOpen || isMini) && (
                  <div className={`${styles.subMenuList} ${isMini ? styles.miniFlyout : ''}`}>
                    {isMini && (
                      <div className={styles.miniFlyoutTitle}>
                        {group.title}
                      </div>
                    )}
                    {group.items.map((item) => {
                      const itemBase = item.href.split('?')[0];
                      const isActive = pathname === itemBase;
                      const badgeCount = item.badgeKey ? liveBadges[item.badgeKey] : null;

                      return (
                        <Link
                          key={item.id}
                          href={item.href}
                          className={`${styles.subNavLink} ${isActive ? styles.subNavLinkActive : ''}`}
                          onClick={() => setMobileSidebarOpen(false)}
                          aria-current={isActive ? 'page' : undefined}
                          title={item.label}
                        >
                          <span>{item.label}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            {item.badge && <span className={styles.navBadge}>{item.badge}</span>}
                            {badgeCount > 0 && (
                              <span className={`${styles.liveCountBadge} ${item.badgeKey === 'lowStock' ? styles.liveCountBadgeAlert : ''}`}>
                                {badgeCount}
                              </span>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer: Profile & Action Buttons (Non-Overlapping) */}
        <div className={styles.sidebarFooter}>
          <div className={styles.adminProfile} title={`${session?.name || 'Store Administrator'} (${session?.role || 'Admin'})`}>
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
              <ExternalLink size={14} />
              <span>Store</span>
            </a>
            <button
              type="button"
              className={styles.signOutBtn}
              disabled={busy}
              onClick={signOut}
              title="Sign out of administration"
            >
              <X size={14} />
              <span>{busy ? '...' : 'Sign out'}</span>
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

          {/* Quick Search with Ctrl+K shortcut */}
          <div
            className={styles.quickSearch}
            onClick={() => setIsCmdOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Open command palette search"
          >
            <Search size={14} strokeWidth={2} />
            <input
              type="text"
              placeholder="Search catalogue, orders, inquiries..."
              aria-label="Quick search"
              readOnly
            />
            <kbd className={styles.quickSearchKbd}>⌘K</kbd>
          </div>

          <div className={styles.topbarRight}>
            <button
              type="button"
              className={styles.toolBtn || styles.topbarStoreLink}
              onClick={toggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'rgba(31, 95, 46, 0.06)',
                border: '1px solid rgba(31, 95, 46, 0.15)',
                borderRadius: '999px',
                padding: '6px 12px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                color: 'inherit'
              }}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={13} color="#e0a040" /> : <Moon size={13} color="#1b5e20" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>

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
              style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '11px' }}
              disabled={busy}
              onClick={signOut}
            >
              {busy ? '...' : 'Sign out'}
            </button>
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main className={styles.main}>
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>

      {/* Command Palette Modal */}
      <AdminCommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </div>
  );
}
