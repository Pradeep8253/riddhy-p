'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingBag,
  MessageSquare,
  Layers,
  Boxes,
  Megaphone,
  Settings,
  Search,
  ExternalLink,
  ChevronDown,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User
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

function formatBadge(count) {
  if (!count || count <= 0) return null;
  return count > 99 ? '99+' : String(count);
}

function AdminShellInner({ children, session }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [busy, setBusy] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMini, setIsMini] = useState(false);
  const [openGroups, setOpenGroups] = useState({});
  const [isCmdOpen, setIsCmdOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const [liveBadges, setLiveBadges] = useState({
    pendingOrders: 0,
    lowStock: 0,
    openClaims: 0,
    newLeads: 0
  });

  // Rehydrate mini state and ensure clean light theme
  useEffect(() => {
    try {
      const savedMini = localStorage.getItem('rf_admin_mini_sidebar');
      if (savedMini === 'true') {
        setIsMini(true);
      }
      localStorage.removeItem('rf_admin_theme');
      document.documentElement.removeAttribute('data-theme');
    } catch {
      // silent
    }
  }, []);

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

  // Real live badges: lightweight endpoint, 60s server cache, 60s visibility-aware polling
  useEffect(() => {
    let timer = null;

    const fetchCounts = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch('/api/admin/nav-counts');
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setLiveBadges({
              pendingOrders: json.data.pendingOrders || 0,
              lowStock: json.data.lowStock || 0,
              openClaims: json.data.openClaims || 0,
              newLeads: json.data.newLeads || 0
            });
          }
        }
      } catch {
        // silent
      }
    };

    fetchCounts();

    const handleVisibility = () => {
      if (!document.hidden) {
        fetchCounts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    timer = setInterval(fetchCounts, 60000);

    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
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
  }, [pathname, searchParams]);

  // Lock body scroll and trap Esc key when mobile sidebar is open
  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mobileSidebarOpen]);

  // Close topbar user menu on outside click or Esc
  useEffect(() => {
    if (!userMenuOpen) return;

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [userMenuOpen]);

  // Precise active check: pathname AND tab query param
  const isLinkActive = (href) => {
    const [targetPath, targetQuery] = href.split('?');
    if (pathname !== targetPath) return false;

    if (targetPath === '/admin/settings') {
      if (!targetQuery) return true;
      const currentTab = searchParams?.get('tab') || 'company';
      const targetTab = new URLSearchParams(targetQuery || '').get('tab') || 'company';
      return currentTab === targetTab;
    }

    const targetParams = new URLSearchParams(targetQuery || '');
    const targetTab = targetParams.get('tab');
    if (targetTab) {
      return searchParams?.get('tab') === targetTab;
    }

    return true;
  };

  // Filter nodes by role and clean empty sections
  const allowedNodes = useMemo(() => {
    const userRole = session?.role || 'admin';

    const filtered = [];
    for (const node of ADMIN_NAV_CONFIG) {
      if (node.roles && !node.roles.includes(userRole)) continue;

      if (node.type === 'section') {
        filtered.push({ ...node });
      } else if (node.type === 'link') {
        filtered.push({ ...node });
      } else if (node.type === 'group') {
        const allowedItems = (node.items || []).filter(
          (item) => !item.roles || item.roles.includes(userRole)
        );
        if (allowedItems.length > 0) {
          filtered.push({ ...node, items: allowedItems });
        }
      }
    }

    // Remove sections that have no links/groups before the next section
    const result = [];
    for (let i = 0; i < filtered.length; i++) {
      const current = filtered[i];
      if (current.type === 'section') {
        let hasChildren = false;
        for (let j = i + 1; j < filtered.length; j++) {
          if (filtered[j].type === 'section') break;
          if (filtered[j].type === 'link' || filtered[j].type === 'group') {
            hasChildren = true;
            break;
          }
        }
        if (hasChildren) {
          result.push(current);
        }
      } else {
        result.push(current);
      }
    }

    return result;
  }, [session?.role]);

  // Auto-expand group containing the active item
  useEffect(() => {
    const newOpen = {};
    allowedNodes.forEach((node) => {
      if (node.type === 'group' && Array.isArray(node.items)) {
        const hasActive = node.items.some((item) => isLinkActive(item.href));
        if (hasActive) {
          newOpen[node.id] = true;
        }
      }
    });
    setOpenGroups((prev) => ({ ...prev, ...newOpen }));
  }, [pathname, searchParams, allowedNodes]);

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

  // Derive active label for breadcrumb (with smart fallback, never 'Executive Overview')
  let activePageName = '';
  for (const node of allowedNodes) {
    if (node.type === 'link' && isLinkActive(node.href)) {
      activePageName = node.label;
      break;
    }
    if (node.type === 'group' && Array.isArray(node.items)) {
      for (const item of node.items) {
        if (isLinkActive(item.href)) {
          activePageName = item.label;
          break;
        }
      }
    }
    if (activePageName) break;
  }

  if (!activePageName) {
    const segments = pathname.split('/').filter(Boolean);
    const lastSeg = segments[segments.length - 1] || 'dashboard';
    activePageName = lastSeg.charAt(0).toUpperCase() + lastSeg.slice(1).replace(/[-_]/g, ' ');
  }

  const userInitials = (session?.name || session?.email || 'AD').slice(0, 2).toUpperCase();

  return (
    <div className={styles.crmContainer} data-lenis-prevent="true">
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
              <span className={styles.brandSubtitle}>Admin Console</span>
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

        {/* Structured Navigation */}
        <nav className={styles.sidebarNav} aria-label="Admin console navigation">
          {allowedNodes.map((node) => {
            // Section Divider
            if (node.type === 'section') {
              return (
                <div key={node.id} className={styles.navSectionHeader}>
                  {node.title}
                </div>
              );
            }

            // Flat Link (No accordion dropdown)
            if (node.type === 'link') {
              const isActive = isLinkActive(node.href);
              const badgeText = node.badgeKey ? formatBadge(liveBadges[node.badgeKey]) : null;

              return (
                <Link
                  key={node.id}
                  href={node.href}
                  className={`${styles.flatNavLink} ${isActive ? styles.flatNavLinkActive : ''}`}
                  onClick={() => setMobileSidebarOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  data-tooltip={node.label}
                  title={node.label}
                >
                  <div className={styles.flatNavLinkLeft}>
                    <span className={styles.navIcon}>
                      <NavIcon name={node.icon} />
                    </span>
                    <span className={styles.flatNavLinkText}>{node.label}</span>
                  </div>
                  {badgeText && (
                    <span className={`${styles.liveCountBadge} ${node.badgeKey === 'lowStock' ? styles.liveCountBadgeAlert : ''}`}>
                      {badgeText}
                    </span>
                  )}
                </Link>
              );
            }

            // Group (Multi-item accordion)
            if (node.type === 'group') {
              const isGroupOpen = Boolean(openGroups[node.id]);
              const hasActiveChild = node.items.some((item) => isLinkActive(item.href));

              return (
                <div key={node.id} className={styles.navGroup}>
                  <button
                    type="button"
                    className={`${styles.groupHeaderBtn} ${hasActiveChild ? styles.groupHeaderBtnActive : ''}`}
                    onClick={() => toggleGroup(node.id)}
                    aria-expanded={isGroupOpen}
                    data-tooltip={node.title}
                    title={node.title}
                  >
                    <div className={styles.groupHeaderLeft}>
                      <span className={styles.navIcon}>
                        <NavIcon name={node.icon} />
                      </span>
                      <span className={styles.groupTitleText}>{node.title}</span>
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
                          {node.title}
                        </div>
                      )}
                      {node.items.map((item) => {
                        const isActive = isLinkActive(item.href);
                        const badgeText = item.badgeKey ? formatBadge(liveBadges[item.badgeKey]) : null;

                        return (
                          <Link
                            key={item.id}
                            href={item.href}
                            className={`${styles.subNavLink} ${isActive ? styles.subNavLinkActive : ''}`}
                            onClick={() => setMobileSidebarOpen(false)}
                            aria-current={isActive ? 'page' : undefined}
                            title={item.tooltip || item.label}
                          >
                            <span>{item.label}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                              {badgeText && (
                                <span className={`${styles.liveCountBadge} ${item.badgeKey === 'lowStock' ? styles.liveCountBadgeAlert : ''}`}>
                                  {badgeText}
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
            }

            return null;
          })}
        </nav>

        {/* Sidebar Footer: Compact status block */}
        <div className={styles.sidebarFooter}>
          <div className={styles.adminProfile} title={`${session?.name || 'Store Administrator'} (${session?.role || 'Admin'})`}>
            <div className={styles.avatar}>
              {userInitials}
            </div>
            <div className={styles.profileInfo}>
              <b>{session?.name || 'Store Administrator'}</b>
              <span>{session?.role ? `${session.role} · Live` : 'Admin · Live'}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT CONTENT AREA */}
      <div className={styles.contentArea} data-lenis-prevent="true">
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

            <Link href="/admin" className={styles.mobileBrand} aria-label="RF Riddhy Admin Dashboard">
              <div className={styles.mobileBrandMark}>RF</div>
            </Link>

            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/admin">Admin</Link>
              <span className={styles.breadcrumbSep}>/</span>
              <span className={styles.breadcrumbActive}>{activePageName}</span>
            </nav>
            <span className={styles.mobilePageTitle}>{activePageName}</span>
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
              placeholder="Search orders, products, customers…"
              aria-label="Quick search"
              readOnly
            />
            <kbd className={styles.quickSearchKbd}>⌘K</kbd>
          </div>

          {/* Topbar User Menu with Avatar Dropdown */}
          <div className={styles.topbarRight}>
            <button
              type="button"
              className={styles.mobileSearchBtn}
              onClick={() => setIsCmdOpen(true)}
              aria-label="Search dashboard"
            >
              <Search size={16} strokeWidth={2.2} />
            </button>

            <div className={styles.userMenuContainer} ref={userMenuRef}>
              <button
                type="button"
                className={styles.userAvatarBtn}
                onClick={() => setUserMenuOpen((prev) => !prev)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User account and settings menu"
              >
                <div className={styles.topbarAvatar}>
                  {userInitials}
                </div>
                <span className={styles.topbarRoleBadge}>
                  {session?.role || 'Admin'}
                </span>
                <ChevronDown size={13} color="#5d7565" />
              </button>

              {userMenuOpen && (
                <div className={styles.userMenuDropdown} role="menu">
                  <div className={styles.userMenuHeader}>
                    <div className={styles.userMenuName}>
                      {session?.name || session?.email || 'Administrator'}
                    </div>
                    <div className={styles.userMenuRole}>
                      {session?.role ? `Role: ${session.role}` : 'Role: Admin'}
                    </div>
                  </div>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.userMenuItem}
                    role="menuitem"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <div className={styles.userMenuItemLeft}>
                      <ExternalLink size={14} />
                      <span>View Store</span>
                    </div>
                    <span style={{ fontSize: 10, color: '#7b857d' }}>Tab ↗</span>
                  </a>


                  <div className={styles.userMenuDivider} />

                  <button
                    type="button"
                    className={`${styles.userMenuItem} ${styles.userMenuSignOut}`}
                    role="menuitem"
                    disabled={busy}
                    onClick={() => {
                      setUserMenuOpen(false);
                      signOut();
                    }}
                  >
                    <div className={styles.userMenuItemLeft}>
                      <LogOut size={14} />
                      <span>{busy ? 'Signing out…' : 'Sign out'}</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Routed Page Content */}
        <main className={styles.main}>
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>

      {/* App Feel Mobile Bottom Navigation Dock */}
      <nav className={styles.mobileBottomDock} aria-label="Quick mobile navigation">
        <Link
          href="/admin"
          className={`${styles.dockItem} ${pathname === '/admin' ? styles.dockItemActive : ''}`}
          aria-current={pathname === '/admin' ? 'page' : undefined}
        >
          <div className={styles.dockIconWrap}>
            <LayoutDashboard size={20} />
          </div>
          <span className={styles.dockLabel}>Overview</span>
        </Link>

        <Link
          href="/admin/orders"
          className={`${styles.dockItem} ${pathname.startsWith('/admin/orders') ? styles.dockItemActive : ''}`}
          aria-current={pathname.startsWith('/admin/orders') ? 'page' : undefined}
        >
          <div className={styles.dockIconWrap}>
            <ShoppingBag size={20} />
            {liveBadges.pendingOrders > 0 && (
              <span className={styles.dockBadge}>
                {liveBadges.pendingOrders > 99 ? '99+' : liveBadges.pendingOrders}
              </span>
            )}
          </div>
          <span className={styles.dockLabel}>Orders</span>
        </Link>

        <Link
          href="/admin/catalogue"
          className={`${styles.dockItem} ${pathname.startsWith('/admin/catalogue') ? styles.dockItemActive : ''}`}
          aria-current={pathname.startsWith('/admin/catalogue') ? 'page' : undefined}
        >
          <div className={styles.dockIconWrap}>
            <Layers size={20} />
          </div>
          <span className={styles.dockLabel}>Products</span>
        </Link>

        <Link
          href="/admin/leads"
          className={`${styles.dockItem} ${pathname.startsWith('/admin/leads') ? styles.dockItemActive : ''}`}
          aria-current={pathname.startsWith('/admin/leads') ? 'page' : undefined}
        >
          <div className={styles.dockIconWrap}>
            <MessageSquare size={20} />
            {liveBadges.newLeads > 0 && (
              <span className={styles.dockBadge}>
                {liveBadges.newLeads > 99 ? '99+' : liveBadges.newLeads}
              </span>
            )}
          </div>
          <span className={styles.dockLabel}>Leads</span>
        </Link>

        <button
          type="button"
          className={`${styles.dockItem} ${mobileSidebarOpen ? styles.dockItemActive : ''}`}
          onClick={() => setMobileSidebarOpen((prev) => !prev)}
          aria-label="Open full admin menu"
          aria-expanded={mobileSidebarOpen}
        >
          <div className={styles.dockIconWrap}>
            <Menu size={20} />
            {(liveBadges.lowStock > 0 || liveBadges.openClaims > 0) && (
              <span className={`${styles.dockBadge} ${styles.dockBadgeAlert}`}>
                {(liveBadges.lowStock + liveBadges.openClaims) > 99 ? '99+' : (liveBadges.lowStock + liveBadges.openClaims)}
              </span>
            )}
          </div>
          <span className={styles.dockLabel}>Menu</span>
        </button>
      </nav>

      {/* Command Palette Modal */}
      <AdminCommandPalette isOpen={isCmdOpen} onClose={() => setIsCmdOpen(false)} />
    </div>
  );
}

export default function AdminShell(props) {
  return (
    <Suspense fallback={null}>
      <AdminShellInner {...props} />
    </Suspense>
  );
}
