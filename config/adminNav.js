/**
 * Centralized Admin CRM Navigation Configuration
 * Defines all primary navigation groups, flat links, section dividers,
 * icon identifiers, route paths, role-based permission requirements, and live badge keys.
 *
 * Supported node types:
 * - 'section': Uppercase divider header (OPERATIONS / CATALOGUE / GROWTH / SYSTEM)
 * - 'link': Flat standalone link (no accordion dropdown)
 * - 'group': Multi-item accordion dropdown (2+ items)
 */

export const ADMIN_NAV_CONFIG = [
  {
    type: 'section',
    id: 'sec-operations',
    title: 'Operations',
    roles: ['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance']
  },
  {
    type: 'link',
    id: 'dashboard',
    label: 'Dashboard',
    href: '/admin',
    icon: 'dashboard',
    roles: ['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance']
  },
  {
    type: 'group',
    id: 'sales',
    title: 'Sales',
    icon: 'sales',
    roles: ['admin', 'super-admin', 'finance', 'warehouse', 'support'],
    items: [
      {
        id: 'orders',
        label: 'Orders',
        href: '/admin/orders',
        badgeKey: 'pendingOrders',
        roles: ['admin', 'super-admin', 'finance', 'warehouse', 'support']
      },
      {
        id: 'invoices',
        label: 'Invoices',
        href: '/admin/invoices',
        roles: ['admin', 'super-admin', 'finance']
      }
    ]
  },
  {
    type: 'link',
    id: 'inventory',
    label: 'Inventory',
    href: '/admin/inventory',
    icon: 'inventory',
    badgeKey: 'lowStock',
    roles: ['admin', 'super-admin', 'warehouse', 'support']
  },

  {
    type: 'section',
    id: 'sec-catalogue',
    title: 'Catalogue',
    roles: ['admin', 'super-admin', 'marketing', 'warehouse']
  },
  {
    type: 'group',
    id: 'catalogue',
    title: 'Catalogue',
    icon: 'catalogue',
    roles: ['admin', 'super-admin', 'marketing', 'warehouse'],
    items: [
      {
        id: 'products',
        label: 'Products',
        href: '/admin/catalogue',
        roles: ['admin', 'super-admin', 'marketing', 'warehouse']
      },
      {
        id: 'merchandising',
        label: 'Collections',
        href: '/admin/merchandising',
        tooltip: 'Homepage product rows and tag collections',
        roles: ['admin', 'super-admin', 'marketing']
      },
      {
        id: 'packages',
        label: 'Wedding Packages',
        href: '/admin/packages',
        roles: ['admin', 'super-admin', 'marketing']
      }
    ]
  },

  {
    type: 'section',
    id: 'sec-customers',
    title: 'Growth & Care',
    roles: ['admin', 'super-admin', 'support', 'marketing']
  },
  {
    type: 'group',
    id: 'customers',
    title: 'Customers',
    icon: 'customers',
    roles: ['admin', 'super-admin', 'support', 'marketing'],
    items: [
      {
        id: 'inquiries',
        label: 'Enquiries',
        href: '/admin/leads',
        badgeKey: 'newLeads',
        roles: ['admin', 'super-admin', 'support', 'marketing']
      },
      {
        id: 'warranty',
        label: 'Warranty Claims',
        href: '/admin/warranty',
        badgeKey: 'openClaims',
        roles: ['admin', 'super-admin', 'support']
      }
    ]
  },
  {
    type: 'link',
    id: 'cms',
    label: 'Banners & Offers',
    href: '/admin/cms',
    icon: 'marketing',
    roles: ['admin', 'super-admin', 'marketing']
  },

  {
    type: 'section',
    id: 'sec-system',
    title: 'System',
    permission: 'settings.view',
    roles: ['admin', 'super-admin', 'finance']
  },
  {
    type: 'link',
    id: 'settings',
    label: 'Settings',
    href: '/admin/settings',
    icon: 'settings',
    permission: 'settings.view',
    roles: ['admin', 'super-admin', 'finance']
  }
];
