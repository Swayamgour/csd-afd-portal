export const MOCK_NOTIFICATIONS = [
  {
    id: 'NOTIF-001',
    type: 'Demand',
    title: 'Supply Order Dispatched to Dealer',
    message: 'Supply order SO/CSD/DEL/2024/0912 for Tata Nexon has been forwarded to Pratham Motors Delhi. Delivery scheduled by 25 Oct 2024.',
    timestamp: '2 hours ago',
    read: false,
    link: '/beneficiary/demands/AFD-DEM-2024-8841',
    roleTarget: ['beneficiary']
  },
  {
    id: 'NOTIF-002',
    type: 'Payment',
    title: 'Payment Realization Confirmed',
    message: 'Payment of ₹11,45,000 received via SBI Cyber Treasury for demand AFD-DEM-2024-8841.',
    timestamp: '1 day ago',
    read: true,
    link: '/beneficiary/payments',
    roleTarget: ['beneficiary', 'csd', 'depot']
  },
  {
    id: 'NOTIF-003',
    type: 'Support',
    title: 'Ticket Escalated to Level 4 (CSD-HO)',
    message: 'Critical ticket HD-2024-41088 (Dealer Overcharging) has breached SLA and reached Level 4 attention.',
    timestamp: '3 hours ago',
    read: false,
    link: '/helpdesk/tickets/HD-2024-41088',
    roleTarget: ['helpdesk', 'csd', 'admin']
  },
  {
    id: 'NOTIF-004',
    type: 'System',
    title: 'Quarterly Price Index Update',
    message: 'OEM Tata Motors has uploaded revised Q4 ex-showroom master rates. Pending CSD-HO committee approval.',
    timestamp: '5 hours ago',
    read: false,
    link: '/csd/products',
    roleTarget: ['csd', 'admin']
  },
  {
    id: 'NOTIF-005',
    type: 'Security',
    title: 'Suspicious IP Blocked',
    message: 'Automated firewall blocked multiple failed brute-force authentication requests originating from 185.220.101.5.',
    timestamp: '8 hours ago',
    read: true,
    link: '/admin/audit-logs',
    roleTarget: ['admin']
  }
];
