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
  { value: 'cs_director', label: 'CS Director', category: 'Directorate & HQ' },
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
  CS_DIRECTOR: 'cs_director',
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
  TECH_SUPPORT: 'helpdesk_agent',
  CSD: 'csd',
  CSD_OFFICIAL: 'csd',
  CSD_HO: 'csd',
  DEPOT: 'depot',
  DEPOT_OFFICIAL: 'depot',
  URC: 'urc',
  URC_USER: 'urc',
  OEM: 'oem',
  OEM_USER: 'oem',
  DEALER: 'dealer',
  DEALER_USER: 'dealer'
};

/**
 * Normalizes any role variant (e.g. 'DEPOT_OFFICIAL', 'depot-nodal', 'CSD_HO', 'CS_DIRECTOR')
 * into its canonical frontend module key ('depot', 'csd', 'dealer', 'cs_director', etc.).
 */
export function normalizeRole(role) {
  if (!role) return '';
  const r = String(role).toLowerCase().trim().replace(/[-_\s]/g, '');
  if (['csdirector', 'csdirecter', 'director', 'csdir'].includes(r)) return 'cs_director';
  if (['depot', 'depotofficial', 'depotnodal'].includes(r)) return 'depot';
  if (['dealer', 'dealeruser'].includes(r)) return 'dealer';
  if (['urc', 'urcuser', 'urcnodal'].includes(r)) return 'urc';
  if (['oem', 'oemuser'].includes(r)) return 'oem';
  if (['admin', 'administrator', 'systemadmin'].includes(r)) return 'admin';
  if (['csd', 'csdho', 'csdofficial', 'csddirectorate', 'csdheadquarters', 'operations', 'subdirectorate'].includes(r)) return 'csd';
  if (['helpdesk', 'helpdeskagent', 'techsupport'].includes(r)) return 'helpdesk_agent';
  if (['helpdesksupervisor'].includes(r)) return 'helpdesk_supervisor';
  if (['beneficiary', 'customer', 'subscriber'].includes(r)) return 'beneficiary';
  return String(role).toLowerCase().trim();
}

export const ROLE_LABELS = WP_ROLES.reduce((acc, r) => {
  acc[r.value] = r.label;
  return acc;
}, {
  admin: 'Administrator',
  administrator: 'Administrator',
  cs_director: 'CS Director',
  CS_DIRECTOR: 'CS Director',
  beneficiary: 'Defence Beneficiary',
  csd: 'CSD Head Office Official',
  csd_ho: 'CSD Head Office Official',
  csdho: 'CSD Head Office Official',
  depot: 'Depot Official',
  depot_official: 'Depot Official',
  'depot-nodal': 'Depot Nodal Officer',
  urc: 'URC Official',
  urc_user: 'URC Official',
  'urc-nodal': 'URC Nodal Officer',
  dealer: 'Dealer Partner',
  dealer_user: 'Dealer Partner',
  oem: 'OEM Partner',
  oem_user: 'OEM Partner',
  helpdesk: 'Helpdesk Support Agent',
  helpdesk_agent: 'Helpdesk Support Agent (L1/L2)',
  helpdesk_supervisor: 'Helpdesk Operations Supervisor',
  tech_support: 'Technical Support'
});

export const ROLE_HOMES = {
  cs_director: '/director/approvals',
  CS_DIRECTOR: '/director/approvals',
  afdfinanceuser: '/csd/payments',
  fnaho: '/csd/dashboard',
  laos_reports: '/csd/reports',
  demand_details: '/csd/demands',
  help_desk: '/helpdesk/dashboard',
  helpdesk: '/helpdesk/dashboard',
  helpdesk_agent: '/helpdesk/dashboard',
  helpdesk_supervisor: '/helpdesk/dashboard',
  tech_support: '/helpdesk/dashboard',
  payer: '/csd/payments',
  audit: '/admin/audit-logs',
  oem: '/oem/dashboard',
  oem_user: '/oem/dashboard',
  registrations: '/csd/beneficiaries',
  operations: '/csd/dashboard',
  manualorder: '/csd/orders',
  'urc-nodal': '/urc/dashboard',
  'depot-nodal': '/depot/dashboard',
  'sub-directorate': '/csd/dashboard',
  state: '/csd/reports',
  csd: '/csd/dashboard',
  csdho: '/csd/dashboard',
  csd_ho: '/csd/dashboard',
  csddirectorate: '/csd/dashboard',
  csdheadquarters: '/csd/dashboard',
  dealer: '/dealer/dashboard',
  dealer_user: '/dealer/dashboard',
  urc: '/urc/dashboard',
  urc_user: '/urc/dashboard',
  depot: '/depot/dashboard',
  depot_official: '/depot/dashboard',
  depotofficial: '/depot/dashboard',
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
 * - CS_DIRECTOR -> Approvals Dashboard ('/director/approvals')
 * - Departmental officials -> Respective control dashboards
 */
export function getRoleNavigatePath(role) {
  if (!role) return '/';
  const norm = normalizeRole(role);

  // 0. CS Director -> Registration Approvals & User Verification Portal
  if (norm === 'cs_director') {
    return '/director/approvals';
  }

  // 1. Beneficiary / Consumer -> Home page ('/')
  if (norm === 'beneficiary' || norm === 'customer' || norm === 'subscriber') {
    return '/';
  }

  // 2. Administrator -> Admin Dashboard ('/admin/dashboard')
  if (norm === 'admin') {
    return '/admin/dashboard';
  }

  // 3. CSD Official / Head Office -> CSD Dashboard
  if (norm === 'csd') {
    return '/csd/dashboard';
  }

  // 4. Depot Official -> Depot Dashboard ('/depot/dashboard')
  if (norm === 'depot') {
    return '/depot/dashboard';
  }

  // 5. URC User -> URC Dashboard ('/urc/dashboard')
  if (norm === 'urc') {
    return '/urc/dashboard';
  }

  // 6. OEM Partner -> OEM Dashboard ('/oem/dashboard')
  if (norm === 'oem') {
    return '/oem/dashboard';
  }

  // 7. Dealer Partner -> Dealer Dashboard ('/dealer/dashboard')
  if (norm === 'dealer') {
    return '/dealer/dashboard';
  }

  // 8. Helpdesk -> Helpdesk Dashboard ('/helpdesk/dashboard')
  if (norm === 'helpdesk_agent' || norm === 'helpdesk_supervisor') {
    return '/helpdesk/dashboard';
  }

  // 9. Finance / Reports
  const r = String(role).toLowerCase().trim();
  if (r === 'afdfinanceuser' || r === 'payer') {
    return '/csd/payments';
  }
  if (r === 'laos_reports' || r === 'audit' || r === 'state') {
    return '/csd/reports';
  }

  return ROLE_HOMES[norm] || ROLE_HOMES[r] || '/';
}
