/**
 * Centralized Role Definitions & Master Roles Configuration
 * 100% Synchronized with WordPress/WooCommerce CSD AFD portal and User Role Editor (URE).
 */

export const WP_ROLES = [
  { value: 'afdfinanceuser', label: 'AFD Finance', category: 'Finance & Treasury' },
  { value: 'fnaho', label: 'FNA HO', category: 'Finance & Treasury' },
  { value: 'laos_reports', label: 'LAOS', category: 'Reports & Audit' },
  { value: 'demand_details', label: 'Demand Details', category: 'Operations & Demands' },
  { value: 'help_desk', label: 'Help Desk', category: 'Support & Assistance' },
  { value: 'helpdesk', label: 'Help Desk', category: 'Support & Assistance' },
  { value: 'payer', label: 'Payer', category: 'Finance & Treasury' },
  { value: 'audit', label: 'Audit', category: 'Reports & Audit' },
  { value: 'oem', label: 'OEM', category: 'Partners & Industry' },
  { value: 'registrations', label: 'Registrations', category: 'Operations & Demands' },
  { value: 'operations', label: 'Operations', category: 'Operations & Demands' },
  { value: 'manualorder', label: 'Manual Order', category: 'Operations & Demands' },
  { value: 'urc-nodal', label: 'URC Nodal Officers', category: 'Field & Station Nodes' },
  { value: 'depot-nodal', label: 'Depot Nodal Officers', category: 'Field & Station Nodes' },
  { value: 'sub-directorate', label: 'CS Directorate 2', category: 'Directorate & HQ' },
  { value: 'state', label: 'State', category: 'State & Taxation' },
  { value: 'csdho', label: 'CSD HO', category: 'Directorate & HQ' },
  { value: 'csddirectorate', label: 'CS Directorate 1', category: 'Directorate & HQ' },
  { value: 'csdheadquarters', label: 'HO AFD', category: 'Directorate & HQ' },
  { value: 'dealer', label: 'Dealer', category: 'Partners & Industry' },
  { value: 'urc', label: 'URC', category: 'Field & Station Nodes' },
  { value: 'depot', label: 'Depot', category: 'Field & Station Nodes' },
  { value: 'shop_manager', label: 'Shop manager', category: 'WooCommerce Storefront' },
  { value: 'customer', label: 'Customer', category: 'Storefront End Users' },
  { value: 'subscriber', label: 'Subscriber', category: 'General Access' },
  { value: 'contributor', label: 'Contributor', category: 'Content Management' },
  { value: 'author', label: 'Author', category: 'Content Management' },
  { value: 'editor', label: 'Editor', category: 'Content Management' },
  { value: 'administrator', label: 'Administrator', category: 'System Administration' }
];

export const MASTER_ROLES = WP_ROLES.map((r) => ({
  code: r.value,
  id: r.value,
  label: r.label,
  category: r.category
}));

export const ROLES = {
  // Exact WordPress Role Keys
  AFD_FINANCE: 'afdfinanceuser',
  FNA_HO: 'fnaho',
  LAOS_REPORTS: 'laos_reports',
  DEMAND_DETAILS: 'demand_details',
  HELP_DESK: 'help_desk',
  PAYER: 'payer',
  AUDIT: 'audit',
  OEM: 'oem',
  REGISTRATIONS: 'registrations',
  OPERATIONS: 'operations',
  MANUAL_ORDER: 'manualorder',
  URC_NODAL: 'urc-nodal',
  DEPOT_NODAL: 'depot-nodal',
  SUB_DIRECTORATE: 'sub-directorate',
  STATE: 'state',
  CSD_HO: 'csdho',
  CSD_DIRECTORATE: 'csddirectorate',
  CSD_HEADQUARTERS: 'csdheadquarters',
  DEALER: 'dealer',
  URC: 'urc',
  DEPOT: 'depot',
  SHOP_MANAGER: 'shop_manager',
  CUSTOMER: 'customer',
  SUBSCRIBER: 'subscriber',
  CONTRIBUTOR: 'contributor',
  AUTHOR: 'author',
  EDITOR: 'editor',
  ADMINISTRATOR: 'administrator',

  // System aliases
  ADMIN: 'admin',
  BENEFICIARY: 'beneficiary',
  HELPDESK_AGENT: 'helpdesk_agent',
  HELPDESK_SUPERVISOR: 'helpdesk_supervisor',
  CSD: 'csd',
  CSD_OFFICIAL: 'csd',
  DEPOT_OFFICIAL: 'depot',
  URC_USER: 'urc',
  OEM_USER: 'oem',
  DEALER_USER: 'dealer'
};

export const ROLE_LABELS = WP_ROLES.reduce((acc, r) => {
  acc[r.value] = r.label;
  return acc;
}, {
  admin: 'Administrator',
  administrator: 'Administrator',
  beneficiary: 'Defence Beneficiary',
  csd: 'CSD Head Office Official',
  helpdesk_agent: 'Helpdesk Support Agent (L1/L2)',
  helpdesk_supervisor: 'Helpdesk Operations Supervisor'
});

export const ROLE_HOMES = {
  afdfinanceuser: '/csd/payments',
  fnaho: '/csd/dashboard',
  laos_reports: '/csd/reports',
  demand_details: '/csd/demands',
  help_desk: '/helpdesk/dashboard',
  payer: '/csd/payments',
  audit: '/admin/audit-logs',
  oem: '/oem/dashboard',
  registrations: '/csd/beneficiaries',
  operations: '/csd/dashboard',
  manualorder: '/csd/orders',
  'urc-nodal': '/urc/dashboard',
  'depot-nodal': '/depot/dashboard',
  'sub-directorate': '/csd/dashboard',
  state: '/csd/reports',
  csdho: '/csd/dashboard',
  csddirectorate: '/csd/dashboard',
  csdheadquarters: '/csd/dashboard',
  dealer: '/dealer/dashboard',
  urc: '/urc/dashboard',
  depot: '/depot/dashboard',
  administrator: '/admin/dashboard',
  admin: '/admin/dashboard',
  beneficiary: '/beneficiary/dashboard',
  customer: '/products',
  subscriber: '/beneficiary/dashboard'
};

/**
 * Determines post-login redirect path based on user role.
 * - BENEFICIARY / Customer -> Home page ('/')
 * - ADMIN / Administrator -> Admin Dashboard ('/admin/dashboard')
 * - Departmental officials -> Respective control dashboards
 */
export function getRoleNavigatePath(role) {
  if (!role) return '/';
  const r = String(role).toLowerCase().trim();

  // 1. Beneficiary / Consumer -> Home page ('/')
  if (r === 'beneficiary' || r === 'customer' || r === 'subscriber') {
    return '/';
  }

  // 2. Administrator -> Admin Dashboard ('/admin/dashboard')
  if (r === 'admin' || r === 'administrator') {
    return '/admin/dashboard';
  }

  // 3. CSD Official / Head Office -> CSD Dashboard
  if (
    r === 'csd' ||
    r === 'csdho' ||
    r === 'csddirectorate' ||
    r === 'csdheadquarters' ||
    r === 'operations' ||
    r === 'sub-directorate'
  ) {
    return '/csd/dashboard';
  }

  // 4. Depot Official -> Depot Dashboard
  if (r === 'depot' || r === 'depot-nodal') {
    return '/depot/dashboard';
  }

  // 5. URC User -> URC Dashboard
  if (r === 'urc' || r === 'urc-nodal') {
    return '/urc/dashboard';
  }

  // 6. OEM Partner -> OEM Dashboard
  if (r === 'oem') {
    return '/oem/dashboard';
  }

  // 7. Dealer Partner -> Dealer Dashboard
  if (r === 'dealer') {
    return '/dealer/dashboard';
  }

  // 8. Helpdesk -> Helpdesk Dashboard
  if (
    r === 'helpdesk' ||
    r === 'help_desk' ||
    r === 'helpdesk_agent' ||
    r === 'helpdesk_supervisor'
  ) {
    return '/helpdesk/dashboard';
  }

  // 9. Finance / Reports
  if (r === 'afdfinanceuser' || r === 'payer') {
    return '/csd/payments';
  }
  if (r === 'laos_reports' || r === 'audit' || r === 'state') {
    return '/csd/reports';
  }

  return ROLE_HOMES[r] || '/';
}
