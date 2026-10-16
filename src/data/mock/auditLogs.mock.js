export const MOCK_AUDIT_LOGS = [
  {
    id: 'AUD-88910',
    user: 'Col. Arvind Sharma (Retd.)',
    role: 'CSD-HO Official',
    action: 'PRICE_UPDATE_APPROVED',
    module: 'Products & Pricing',
    entity: 'Tata Safari Facelift (All Variants)',
    timestamp: '2024-10-14 11:20:15',
    ip: '10.14.22.8',
    status: 'Success',
    details: 'Approved 2.1% quarterly price index adjustment submitted by Tata Motors OEM Desk.'
  },
  {
    id: 'AUD-88909',
    user: 'Lt. Col. S. N. Rao',
    role: 'Depot Manager',
    action: 'SUPPLY_ORDER_ISSUED',
    module: 'Demands & Allocation',
    entity: 'SO/CSD/DEL/2024/0912',
    timestamp: '2024-10-12 15:20:00',
    ip: '14.139.60.22',
    status: 'Success',
    details: 'Generated digital supply order for Beneficiary Subedar Major Rajesh Kumar (JC-765432X).'
  },
  {
    id: 'AUD-88908',
    user: 'Harpreet Singh Walia',
    role: 'Dealer',
    action: 'CHASSIS_ALLOCATED',
    module: 'Orders & Inventory',
    entity: 'MAT621045RP98102',
    timestamp: '2024-10-14 10:05:42',
    ip: '103.21.126.94',
    status: 'Success',
    details: 'Chassis VIN allocated against SO/CSD/DEL/2024/0912.'
  },
  {
    id: 'AUD-88907',
    user: 'Admin Officer K. S. Pillai',
    role: 'System Administrator',
    action: 'ROLE_PERMISSION_MODIFIED',
    module: 'Access Control',
    entity: 'Role: HELPDESK_SUPERVISOR',
    timestamp: '2024-10-13 16:30:11',
    ip: '10.200.1.4',
    status: 'Success',
    details: 'Granted tickets.close and reports.export permissions to supervisor tier.'
  },
  {
    id: 'AUD-88906',
    user: 'Anita Sen',
    role: 'Helpdesk Supervisor',
    action: 'TICKET_ESCALATED_L4',
    module: 'Helpdesk',
    entity: 'HD-2024-41088',
    timestamp: '2024-10-10 10:00:29',
    ip: '10.14.22.19',
    status: 'Success',
    details: 'Escalated critical dealer overcharging case to CSD-HO Joint Director.'
  },
  {
    id: 'AUD-88905',
    user: 'Anonymous / Unknown',
    role: 'Guest / External',
    action: 'FAILED_LOGIN_ATTEMPT',
    module: 'Authentication',
    entity: 'Username: CSD_HO_ADMIN',
    timestamp: '2024-10-14 03:15:22',
    ip: '185.220.101.5',
    status: 'Failed',
    details: 'Invalid password. Account locked after 3 consecutive failed attempts from foreign IP.'
  }
];

export const MOCK_AUTH_LOGS = [
  {
    id: 'AUTH-99120',
    username: 'JC-765432X',
    name: 'Subedar Major Rajesh Kumar',
    role: 'Beneficiary',
    loginMethod: 'Password + Aadhaar OTP',
    timestamp: '2024-10-14 10:15:00',
    ip: '49.36.120.14 (Delhi, Airtel)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Success'
  },
  {
    id: 'AUTH-99119',
    username: 'CSD_HO_089',
    name: 'Col. Arvind Sharma (Retd.)',
    role: 'CSD-HO Official',
    loginMethod: 'Govt SSO / 2FA Token',
    timestamp: '2024-10-14 09:30:20',
    ip: '10.14.22.8 (Govt Intranet)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Success'
  },
  {
    id: 'AUTH-99118',
    username: 'DEPOT_MGR_DEL',
    name: 'Lt. Col. S. N. Rao',
    role: 'Depot Manager',
    loginMethod: 'Password + OTP',
    timestamp: '2024-10-14 09:10:44',
    ip: '14.139.60.22 (NIC RailWire)',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'Success'
  },
  {
    id: 'AUTH-99117',
    username: 'HD_AGENT_104',
    name: 'Rakesh Verma',
    role: 'Helpdesk Agent',
    loginMethod: 'Helpdesk SSO',
    timestamp: '2024-10-14 08:55:00',
    ip: '10.14.22.31 (CSD Helpdesk LAN)',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'Success'
  },
  {
    id: 'AUTH-99116',
    username: 'TEST_HACKER',
    name: 'Unknown',
    role: 'None',
    loginMethod: 'Direct Form Post',
    timestamp: '2024-10-14 02:40:11',
    ip: '194.26.29.112 (Tor Exit Node)',
    userAgent: 'Python-requests/2.28.1',
    status: 'Blocked'
  }
];
