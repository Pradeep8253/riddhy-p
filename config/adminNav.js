/**
 * Centralized Admin CRM Navigation Configuration
 * Defines all primary navigation groups, sub-menus, icon identifiers,
 * route paths, role-based permission requirements, and live badge keys.
 */

export const ADMIN_NAV_CONFIG = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: 'dashboard',
    roles: ['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance'],
    items: [
      {
        id: 'overview',
        label: 'Executive Overview',
        href: '/admin',
        roles: ['admin', 'super-admin', 'support', 'warehouse', 'marketing', 'finance']
      }
    ]
  },
  {
    id: 'sales',
    title: 'Sales & Revenue',
    icon: 'sales',
    roles: ['admin', 'super-admin', 'finance', 'warehouse', 'support'],
    items: [
      {
        id: 'orders',
        label: 'Orders & Shipments',
        href: '/admin/orders',
        badgeKey: 'pendingOrders',
        roles: ['admin', 'super-admin', 'finance', 'warehouse', 'support']
      },
      {
        id: 'invoices',
        label: 'GST Invoices',
        href: '/admin/invoices',
        roles: ['admin', 'super-admin', 'finance']
      }
    ]
  },
  {
    id: 'catalogue',
    title: 'Catalogue',
    icon: 'catalogue',
    roles: ['admin', 'super-admin', 'marketing', 'warehouse'],
    items: [
      {
        id: 'products',
        label: 'Products & SKUs',
        href: '/admin/catalogue',
        roles: ['admin', 'super-admin', 'marketing', 'warehouse']
      },
      {
        id: 'merchandising',
        label: 'Merchandising Rails',
        href: '/admin/merchandising',
        roles: ['admin', 'super-admin', 'marketing']
      },
      {
        id: 'packages',
        label: 'Marriage Packages',
        href: '/admin/packages',
        badge: 'Special',
        roles: ['admin', 'super-admin', 'marketing']
      }
    ]
  },
  {
    id: 'inventory',
    title: 'Inventory & Supply',
    icon: 'inventory',
    roles: ['admin', 'super-admin', 'warehouse', 'support'],
    items: [
      {
        id: 'stock',
        label: 'Stock Levels & Warehouses',
        href: '/admin/inventory',
        badgeKey: 'lowStock',
        roles: ['admin', 'super-admin', 'warehouse', 'support']
      }
    ]
  },
  {
    id: 'customers',
    title: 'Customers & Care',
    icon: 'customers',
    roles: ['admin', 'super-admin', 'support', 'marketing'],
    items: [
      {
        id: 'inquiries',
        label: 'Customer Inquiries & Leads',
        href: '/admin/leads',
        badgeKey: 'newLeads',
        roles: ['admin', 'super-admin', 'support', 'marketing']
      },
      {
        id: 'warranty',
        label: 'Warranty & Claims',
        href: '/admin/warranty',
        badge: 'Portal',
        badgeKey: 'openClaims',
        roles: ['admin', 'super-admin', 'support']
      }
    ]
  },
  {
    id: 'marketing',
    title: 'Marketing & CMS',
    icon: 'marketing',
    roles: ['admin', 'super-admin', 'marketing'],
    items: [
      {
        id: 'cms',
        label: 'CMS & Campaigns',
        href: '/admin/cms',
        roles: ['admin', 'super-admin', 'marketing']
      }
    ]
  },
  {
    id: 'settings',
    title: 'Settings & Config',
    icon: 'settings',
    roles: ['admin', 'super-admin'],
    items: [
      {
        id: 'company',
        label: 'Company & Invoice',
        href: '/admin/settings?tab=company',
        roles: ['admin', 'super-admin']
      },
      {
        id: 'store',
        label: 'Store & Customer Care',
        href: '/admin/settings?tab=care',
        roles: ['admin', 'super-admin']
      },
      {
        id: 'showroom',
        label: 'Showroom Location',
        href: '/admin/settings?tab=showroom',
        roles: ['admin', 'super-admin']
      },
      {
        id: 'consultation',
        label: 'Consultation Capacity',
        href: '/admin/settings?tab=consultation',
        roles: ['admin', 'super-admin']
      },
      {
        id: 'brandStory',
        label: 'Brand Story & Proof',
        href: '/admin/settings?tab=story',
        roles: ['admin', 'super-admin']
      }
    ]
  }
];
