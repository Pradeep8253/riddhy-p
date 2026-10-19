'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  ArrowRight,
  Layers,
  ShoppingBag,
  MessageSquare,
  FileText,
  Settings,
  Boxes,
  ShieldCheck,
  Megaphone,
  LayoutDashboard
} from 'lucide-react';
import { ADMIN_NAV_CONFIG } from '@/config/adminNav';
import styles from './AdminCommandPalette.module.css';

export default function AdminCommandPalette({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [asyncResults, setAsyncResults] = useState({ orders: [], products: [], leads: [] });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setAsyncResults({ orders: [], products: [], leads: [] });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via custom event or parent
          window.dispatchEvent(new CustomEvent('rf_open_cmd_palette'));
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced server search
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setAsyncResults({ orders: [], products: [], leads: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/admin/search?q=${encodeURIComponent(q)}`);
        const json = await res.json();
        if (res.ok && json.success) {
          setAsyncResults(json.data);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  // Legacy and synonym aliases for search
  const NAV_ALIASES = {
    '/admin': ['executive', 'overview', 'home', 'kpis', 'summary'],
    '/admin/orders': ['shipments', 'fulfillment', 'deliveries', 'sales'],
    '/admin/invoices': ['gst', 'tax', 'bill', 'receipt', 'gstin'],
    '/admin/catalogue': ['products', 'skus', 'items', 'furnishings', 'appliances'],
    '/admin/merchandising': ['rails', 'collections', 'featured', 'homepage rows'],
    '/admin/packages': ['marriage', 'wedding', 'bundles', 'combos'],
    '/admin/inventory': ['stock', 'warehouses', 'levels', 'storage', 'depot'],
    '/admin/leads': ['inquiries', 'inbox', 'consultations', 'messages', 'contact'],
    '/admin/warranty': ['claims', 'portal', 'rma', 'repairs', 'coverage'],
    '/admin/cms': ['campaigns', 'banners', 'promotions', 'marketing'],
    '/admin/settings': ['config', 'configuration', 'preferences', 'system', 'options'],
    '/admin/settings?tab=company': ['legal', 'gstin', 'pan', 'invoice settings', 'bank', 'billing', 'taxes'],
    '/admin/settings?tab=care': ['support', 'care', 'customer service', 'helpdesk', 'whatsapp'],
    '/admin/settings?tab=showroom': ['store location', 'experience centre', 'hours', 'map', 'directions'],
    '/admin/settings?tab=consultation': ['capacity', 'slots', 'appointments', 'home visit', 'booking'],
    '/admin/settings?tab=story': ['about', 'proof', 'milestones', 'founders', 'metrics'],
    '/admin/settings?tab=team': ['admins', 'users', 'staff', 'invite', 'accounts', 'colleagues'],
    '/admin/settings?tab=roles': ['access', 'privileges', 'matrix', 'rbac', 'security roles', 'permissions'],
    '/admin/settings?tab=security': ['2fa', 'totp', 'password policy', 'session', 'lockout', 'authentication'],
    '/admin/settings?tab=audit': ['history', 'events', 'logs', 'activity', 'compliance', 'trail']
  };

  const SETTINGS_SEARCH_ITEMS = [
    { label: 'Company & Billing', href: '/admin/settings?tab=company' },
    { label: 'Store & Support', href: '/admin/settings?tab=care' },
    { label: 'Showroom Location', href: '/admin/settings?tab=showroom' },
    { label: 'Consultation Capacity', href: '/admin/settings?tab=consultation' },
    { label: 'Brand Story & Proof', href: '/admin/settings?tab=story' },
    { label: 'Team Members', href: '/admin/settings?tab=team' },
    { label: 'Roles & Permissions', href: '/admin/settings?tab=roles' },
    { label: 'Security & 2FA', href: '/admin/settings?tab=security' },
    { label: 'Audit Log', href: '/admin/settings?tab=audit' }
  ];

  // Filter navigation links locally
  const qLower = query.toLowerCase().trim();
  const matchedNav = [];

  ADMIN_NAV_CONFIG.forEach((node) => {
    if (node.type === 'link') {
      const aliases = NAV_ALIASES[node.href] || [];
      const matches =
        !qLower ||
        node.label.toLowerCase().includes(qLower) ||
        aliases.some((a) => a.includes(qLower));

      if (matches) {
        matchedNav.push({
          group: node.href.startsWith('/admin/settings') ? 'Settings' : 'Navigation',
          label: node.label,
          href: node.href
        });
      }
    } else if (node.type === 'group' && Array.isArray(node.items)) {
      node.items.forEach((item) => {
        const aliases = NAV_ALIASES[item.href] || [];
        const matches =
          !qLower ||
          item.label.toLowerCase().includes(qLower) ||
          node.title.toLowerCase().includes(qLower) ||
          aliases.some((a) => a.includes(qLower));

        if (matches) {
          matchedNav.push({
            group: node.title,
            label: item.label,
            href: item.href
          });
        }
      });
    }
  });

  // Always include specific Settings tabs in search
  SETTINGS_SEARCH_ITEMS.forEach((tab) => {
    const aliases = NAV_ALIASES[tab.href] || [];
    const matches =
      !qLower ||
      tab.label.toLowerCase().includes(qLower) ||
      'settings'.includes(qLower) ||
      aliases.some((a) => a.includes(qLower));

    if (matches) {
      matchedNav.push({
        group: 'Settings',
        label: tab.label,
        href: tab.href
      });
    }
  });

  const handleSelect = (href) => {
    onClose();
    router.push(href);
  };

  const hasResults =
    matchedNav.length > 0 ||
    asyncResults.orders.length > 0 ||
    asyncResults.products.length > 0 ||
    asyncResults.leads.length > 0;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true" aria-label="Command search palette">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Search Input Header */}
        <div className={styles.searchHeader}>
          <Search size={18} />
          <input
            ref={inputRef}
            className={styles.searchInput}
            placeholder="Search orders, products, customers…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" className={styles.escBadge} onClick={onClose}>
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className={styles.resultsBody}>
          {/* Navigation Quick Links */}
          {matchedNav.length > 0 && (
            <div>
              <div className={styles.sectionTitle}>Navigation & Pages</div>
              <div className={styles.resultList}>
                {matchedNav.slice(0, 5).map((nav) => (
                  <div
                    key={nav.href}
                    className={styles.resultItem}
                    onClick={() => handleSelect(nav.href)}
                  >
                    <div className={styles.resultItemLeft}>
                      <ArrowRight size={14} />
                      <div className={styles.resultText}>
                        <b>{nav.label}</b>
                        <small>{nav.group}</small>
                      </div>
                    </div>
                    <span className={styles.resultBadge}>Jump to</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Orders Results */}
          {asyncResults.orders.length > 0 && (
            <div>
              <div className={styles.sectionTitle}>Orders ({asyncResults.orders.length})</div>
              <div className={styles.resultList}>
                {asyncResults.orders.map((o) => (
                  <div
                    key={o.id}
                    className={styles.resultItem}
                    onClick={() => handleSelect(o.href)}
                  >
                    <div className={styles.resultItemLeft}>
                      <ShoppingBag size={14} />
                      <div className={styles.resultText}>
                        <b>{o.title}</b>
                        <small>{o.subtitle}</small>
                      </div>
                    </div>
                    <span className={styles.resultBadge}>{o.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Products Results */}
          {asyncResults.products.length > 0 && (
            <div>
              <div className={styles.sectionTitle}>Catalogue ({asyncResults.products.length})</div>
              <div className={styles.resultList}>
                {asyncResults.products.map((p) => (
                  <div
                    key={p.id}
                    className={styles.resultItem}
                    onClick={() => handleSelect(p.href)}
                  >
                    <div className={styles.resultItemLeft}>
                      <Layers size={14} />
                      <div className={styles.resultText}>
                        <b>{p.title}</b>
                        <small>{p.subtitle}</small>
                      </div>
                    </div>
                    <span className={styles.resultBadge}>{p.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Leads Results */}
          {asyncResults.leads.length > 0 && (
            <div>
              <div className={styles.sectionTitle}>Inquiries & Leads ({asyncResults.leads.length})</div>
              <div className={styles.resultList}>
                {asyncResults.leads.map((l) => (
                  <div
                    key={l.id}
                    className={styles.resultItem}
                    onClick={() => handleSelect(l.href)}
                  >
                    <div className={styles.resultItemLeft}>
                      <MessageSquare size={14} />
                      <div className={styles.resultText}>
                        <b>{l.title}</b>
                        <small>{l.subtitle}</small>
                      </div>
                    </div>
                    <span className={styles.resultBadge}>{l.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!hasResults && (
            <div className={styles.emptyState}>
              {loading ? 'Searching CRM records…' : 'No matching pages, orders, or pieces found.'}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerShortcuts}>
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>ESC</kbd> Close</span>
          </div>
          <span>RF Riddhy · Admin Console</span>
        </div>
      </div>
    </div>
  );
}
