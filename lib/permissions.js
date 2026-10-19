/**
 * Permissions Engine & Central Access Control Catalog
 * Defines all standard permissions grouped by operational module,
 * default role-to-permission assignments, and authorization evaluation helpers.
 */

export const PERMISSION_MODULES = [
  {
    module: 'dashboard',
    label: 'Dashboard & Reports',
    permissions: [
      { key: 'dashboard.view', label: 'View Dashboard & KPIs', desc: 'Access revenue metrics and operational overview' },
      { key: 'dashboard.export', label: 'Export Reports', desc: 'Download CSV and Excel operational summaries' }
    ]
  },
  {
    module: 'orders',
    label: 'Orders & Shipments',
    permissions: [
      { key: 'orders.view', label: 'View Orders', desc: 'Browse and inspect customer orders and customer details' },
      { key: 'orders.edit', label: 'Manage & Dispatch Orders', desc: 'Update order status, fulfillment tracking, and courier details' },
      { key: 'orders.refund', label: 'Process Refunds', desc: 'Initiate refunds and trigger credit notes' },
      { key: 'orders.export', label: 'Export Orders', desc: 'Download order spreadsheets' }
    ]
  },
  {
    module: 'invoices',
    label: 'GST Invoices & Credit Notes',
    permissions: [
      { key: 'invoices.view', label: 'View Invoices', desc: 'Inspect statutory tax invoices and credit notes' },
      { key: 'invoices.create', label: 'Issue & Void Invoices', desc: 'Generate invoices and credit notes' },
      { key: 'invoices.export', label: 'Export Tax Data', desc: 'Export GSTR-1 Excel worksheets and Tally CSV' }
    ]
  },
  {
    module: 'catalogue',
    label: 'Products & Catalogue',
    permissions: [
      { key: 'products.view', label: 'View Products', desc: 'Browse catalogue, variants, and stock counts' },
      { key: 'products.create', label: 'Create Products', desc: 'Add new items and variant specifications' },
      { key: 'products.edit', label: 'Edit Products', desc: 'Modify pricing, descriptions, HSN, and tax rates' },
      { key: 'products.delete', label: 'Archive / Delete Products', desc: 'Remove catalogue items' },
      { key: 'products.import', label: 'Bulk Import', desc: 'Import CSV product spreadsheets' },
      { key: 'products.export', label: 'Bulk Export', desc: 'Download product catalogues' },
      { key: 'collections.manage', label: 'Manage Collections', desc: 'Curate homepage merchandising rails and tag hubs' },
      { key: 'packages.manage', label: 'Manage Wedding Packages', desc: 'Configure wedding bundles and home room setups' }
    ]
  },
  {
    module: 'inventory',
    label: 'Inventory & Warehouses',
    permissions: [
      { key: 'inventory.view', label: 'View Inventory', desc: 'Inspect depot stock balances and safety thresholds' },
      { key: 'inventory.edit', label: 'Adjust Stock', desc: 'Modify quantities, record inward stock, and set reorder alerts' }
    ]
  },
  {
    module: 'customers',
    label: 'Customers & Leads',
    permissions: [
      { key: 'leads.view', label: 'View Inquiries & Leads', desc: 'Inspect consultation requests and contact messages' },
      { key: 'leads.edit', label: 'Manage Inquiries', desc: 'Assign leads, update status, and record notes' },
      { key: 'warranty.view', label: 'View Warranty Claims', desc: 'Review submitted product warranty claims' },
      { key: 'warranty.edit', label: 'Process Claims', desc: 'Approve, reject, or schedule technician visits' },
      { key: 'warranty.export', label: 'Export Warranty Data', desc: 'Export claim records' }
    ]
  },
  {
    module: 'marketing',
    label: 'Banners, Offers & CMS',
    permissions: [
      { key: 'banners.manage', label: 'Manage Banners', desc: 'Update homepage hero sliders and promotional strips' },
      { key: 'coupons.manage', label: 'Manage Coupon Codes', desc: 'Create discounts, percentage offers, and minimum cart caps' },
      { key: 'media.manage', label: 'Media Library', desc: 'Upload and organize assets in Cloudinary' }
    ]
  },
  {
    module: 'settings',
    label: 'Settings & Administration',
    permissions: [
      { key: 'settings.view', label: 'View Settings', desc: 'Read company profile, store policies, and showroom details' },
      { key: 'settings.edit', label: 'Edit Store Settings', desc: 'Modify company GSTIN, invoicing rules, and care desks' },
      { key: 'settings.security', label: 'Security & 2FA', desc: 'Manage password policies and TOTP enforcement' },
      { key: 'team.manage', label: 'Manage Team Members', desc: 'Invite admins, change roles, and deactivate accounts' },
      { key: 'roles.manage', label: 'Manage Roles & Permissions', desc: 'Create, clone, and configure role permission matrices' },
      { key: 'audit.view', label: 'View Audit Log', desc: 'Inspect system events and sensitive action history' }
    ]
  }
];

// Flat list of all available permission keys
export const ALL_PERMISSIONS = PERMISSION_MODULES.flatMap((m) => m.permissions.map((p) => p.key));

/**
 * Standard default permissions for system roles to preserve 100% backward compatibility
 */
export const DEFAULT_ROLE_PERMISSIONS = {
  'super-admin': [...ALL_PERMISSIONS],
  admin: ALL_PERMISSIONS.filter((p) => !p.startsWith('roles.delete')), // admin has full access to settings & operations
  finance: [
    'dashboard.view',
    'orders.view',
    'orders.export',
    'invoices.view',
    'invoices.create',
    'invoices.export',
    'settings.view'
  ],
  warehouse: [
    'dashboard.view',
    'orders.view',
    'orders.edit',
    'inventory.view',
    'inventory.edit',
    'products.view'
  ],
  marketing: [
    'dashboard.view',
    'products.view',
    'products.create',
    'products.edit',
    'products.export',
    'collections.manage',
    'packages.manage',
    'banners.manage',
    'coupons.manage',
    'leads.view',
    'media.manage'
  ],
  support: [
    'dashboard.view',
    'orders.view',
    'inventory.view',
    'leads.view',
    'leads.edit',
    'warranty.view',
    'warranty.edit',
    'warranty.export'
  ]
};

/**
 * Check if a session user holds a specific permission key.
 *
 * @param {Object} session - Authenticated user session
 * @param {string} permissionKey - e.g. 'orders.edit', 'settings.view'
 * @returns {boolean}
 */
export function can(session, permissionKey) {
  if (!session || !session.role) return false;

  // super-admin has unconditional access
  if (session.role === 'super-admin') return true;

  // If explicit permissions array exists on session
  if (Array.isArray(session.permissions)) {
    if (session.permissions.includes('*')) return true;
    if (session.permissions.includes(permissionKey)) return true;

    // Sub-permission inheritance: if user has settings.view, they can view specific setting tabs
    if (permissionKey.startsWith('settings.') && session.permissions.includes('settings.view')) {
      if (permissionKey === 'settings.security') {
        return session.permissions.includes('settings.security');
      }
      return true;
    }
    return false;
  }

  // Fallback to role-based default permissions map
  const rolePerms = DEFAULT_ROLE_PERMISSIONS[session.role] || [];
  if (rolePerms.includes(permissionKey)) return true;

  if (permissionKey.startsWith('settings.') && rolePerms.includes('settings.view')) {
    if (permissionKey === 'settings.security') {
      return rolePerms.includes('settings.security');
    }
    return true;
  }

  return false;
}

/**
 * Check if session holds ANY of the provided permission keys
 */
export function canAny(session, permissionKeys = []) {
  if (!session) return false;
  if (session.role === 'super-admin') return true;
  return permissionKeys.some((key) => can(session, key));
}

/**
 * Check if session holds ALL of the provided permission keys
 */
export function canAll(session, permissionKeys = []) {
  if (!session) return false;
  if (session.role === 'super-admin') return true;
  return permissionKeys.every((key) => can(session, key));
}
