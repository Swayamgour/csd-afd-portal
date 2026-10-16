export const ROLES = {
  BENEFICIARY: 'beneficiary',
  CSD: 'csd',
  CSD_OFFICIAL: 'csd',
  DEPOT: 'depot',
  DEPOT_OFFICIAL: 'depot',
  URC: 'urc',
  URC_USER: 'urc',
  OEM: 'oem',
  OEM_USER: 'oem',
  DEALER: 'dealer',
  DEALER_USER: 'dealer',
  HELPDESK_AGENT: 'helpdesk_agent',
  HELPDESK_SUPERVISOR: 'helpdesk_supervisor',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  [ROLES.BENEFICIARY]: 'Defence Beneficiary',
  [ROLES.CSD]: 'CSD Head Office Official',
  [ROLES.DEPOT]: 'Depot Operations Manager',
  [ROLES.URC]: 'Unit Run Canteen (URC) Officer',
  [ROLES.OEM]: 'Original Equipment Manufacturer (OEM)',
  [ROLES.DEALER]: 'Authorized Dealer Partner',
  [ROLES.HELPDESK_AGENT]: 'Helpdesk Support Agent (L1/L2)',
  [ROLES.HELPDESK_SUPERVISOR]: 'Helpdesk Operations Supervisor',
  [ROLES.ADMIN]: 'System Administrator'
};

export const ROLE_HOMES = {
  [ROLES.BENEFICIARY]: '/beneficiary/dashboard',
  [ROLES.CSD]: '/csd/dashboard',
  [ROLES.DEPOT]: '/depot/dashboard',
  [ROLES.URC]: '/urc/dashboard',
  [ROLES.OEM]: '/oem/dashboard',
  [ROLES.DEALER]: '/dealer/dashboard',
  [ROLES.HELPDESK_AGENT]: '/helpdesk/dashboard',
  [ROLES.HELPDESK_SUPERVISOR]: '/helpdesk/dashboard',
  [ROLES.ADMIN]: '/admin/dashboard'
};
