export const MOCK_TICKETS = [
  {
    id: 'HD-2024-41092',
    subject: 'Delay in Supply Order Generation after SBI e-Pay Realization',
    category: 'Supply Order',
    subCategory: 'SO Generation Delay',
    severity: 'High',
    priority: 'P2',
    source: 'Beneficiary Portal',
    status: 'In_Progress', // 'Open' | 'Assigned' | 'In_Progress' | 'Escalated' | 'Resolved' | 'Closed'
    escalationLevel: 2, // 1: Helpdesk Agent, 2: Technical Team, 3: Specialist / Dev, 4: CSD Escalation
    escalationPath: [
      { level: 1, title: 'Helpdesk Agent (L1)', owner: 'Rakesh Verma', status: 'Completed', timestamp: '2024-10-10 11:30' },
      { level: 2, title: 'Technical Team (L2)', owner: 'Depot Systems Cell', status: 'Current', timestamp: '2024-10-11 09:15' },
      { level: 3, title: 'Specialist / Dev (L3)', owner: 'Payment Gateway Integration Lead', status: 'Pending', timestamp: null },
      { level: 4, title: 'CSD-HO Escalation (L4)', owner: 'Joint Director (AFD)', status: 'Pending', timestamp: null },
    ],
    userId: 'USR-BEN-001',
    userName: 'Subedar Major Rajesh Kumar',
    userRole: 'Beneficiary',
    serviceNumber: 'JC-765432X',
    demandId: 'AFD-DEM-2024-8841',
    assignedAgentId: 'USR-HD-001',
    assignedAgentName: 'Rakesh Verma',
    assignedSupervisor: 'Anita Sen',
    createdDate: '2024-10-10 10:45',
    slaTargetDate: '2024-10-14 17:00',
    slaStatus: 'Within_SLA', // 'Within_SLA' | 'Breached' | 'Near_Breach'
    slaHoursRemaining: 18,
    timeline: [
      { step: 'Created', by: 'Subedar Major Rajesh Kumar', date: '2024-10-10 10:45', note: 'Beneficiary reported that payment of Rs. 11,45,000 was debited but SO was not visible.' },
      { step: 'Assigned to Agent', by: 'System Auto-Router', date: '2024-10-10 11:00', note: 'Ticket routed to L1 Agent Rakesh Verma.' },
      { step: 'Agent First Response', by: 'Rakesh Verma', date: '2024-10-10 11:30', note: 'Challan verified in SBI Cyber Treasury logs. Escalated to Technical Team for batch clearance.' },
      { step: 'Escalated to Level 2', by: 'Rakesh Verma', date: '2024-10-11 09:15', note: 'Handed over to Depot Systems Cell for manual SO trigger.' },
    ],
    conversation: [
      {
        id: 'msg-1',
        sender: 'Subedar Major Rajesh Kumar',
        senderRole: 'Beneficiary',
        timestamp: '2024-10-10 10:45',
        message: 'Respected Sir, I have transferred Rs 11,45,000 for Tata Nexon via SBI e-Pay yesterday. The money has been deducted from my account but demand status is still showing Payment Pending. Kindly verify urgently as dealer has car in stock.',
        attachments: ['SBI_Payment_Receipt_991204.pdf']
      },
      {
        id: 'msg-2',
        sender: 'Rakesh Verma (Helpdesk Agent)',
        senderRole: 'Helpdesk',
        timestamp: '2024-10-10 11:30',
        message: 'Dear Sir, Jai Hind. We have received your query along with the payment receipt. We have matched your transaction ref SBIEP-20241014-991204 with the SBI Cyber Treasury file. The transaction is successful. We are routing this to the Depot IT Technical team to sync the database status and release your Supply Order.',
        attachments: []
      },
      {
        id: 'msg-3',
        sender: 'Depot Systems Cell',
        senderRole: 'Technical Team (L2)',
        timestamp: '2024-10-11 14:20',
        message: 'Batch sync job scheduled for 16:00 hrs today. The status will update to Supply Order Issued once the digital sign server completes the certificate stamping.',
        attachments: []
      }
    ]
  },
  {
    id: 'HD-2024-41088',
    subject: 'Mismatch in Ex-Showroom Quota Price vs Dealer Invoice',
    category: 'Pricing',
    subCategory: 'Dealer Overcharging',
    severity: 'Critical',
    priority: 'P1',
    source: 'Beneficiary Portal',
    status: 'Escalated',
    escalationLevel: 4,
    escalationPath: [
      { level: 1, title: 'Helpdesk Agent (L1)', owner: 'Rakesh Verma', status: 'Completed', timestamp: '2024-10-08 09:30' },
      { level: 2, title: 'Technical Team (L2)', owner: 'Pricelist Sync Cell', status: 'Completed', timestamp: '2024-10-08 14:00' },
      { level: 3, title: 'Specialist / Dev (L3)', owner: 'Legal & Audit Desk', status: 'Completed', timestamp: '2024-10-09 11:30' },
      { level: 4, title: 'CSD-HO Escalation (L4)', owner: 'Col. Arvind Sharma (Joint Director)', status: 'Current', timestamp: '2024-10-10 10:00' },
    ],
    userId: 'USR-BEN-002',
    userName: 'Havildar Pradeep Singh',
    userRole: 'Beneficiary',
    serviceNumber: '15489210M',
    demandId: 'AFD-DEM-2024-7719',
    assignedAgentId: 'USR-HD-001',
    assignedAgentName: 'Rakesh Verma',
    assignedSupervisor: 'Anita Sen',
    createdDate: '2024-10-08 09:10',
    slaTargetDate: '2024-10-10 09:10',
    slaStatus: 'Breached',
    slaHoursRemaining: -12,
    timeline: [
      { step: 'Created', by: 'Havildar Pradeep Singh', date: '2024-10-08 09:10', note: 'Dealer asked extra handling charges of Rs. 15,000' },
      { step: 'Assigned', by: 'System', date: '2024-10-08 09:15', note: 'Assigned to Rakesh Verma' },
      { step: 'Escalated to L2', by: 'Rakesh Verma', date: '2024-10-08 14:00', note: 'Verified against OEM Master Price list' },
      { step: 'Escalated to L3', by: 'Anita Sen', date: '2024-10-09 11:30', note: 'Show-cause inquiry drafted' },
      { step: 'Escalated to L4 CSD-HO', by: 'Anita Sen', date: '2024-10-10 10:00', note: 'Forwarded to CSD-HO for punitive action against dealer code DLR-UP-011' },
    ],
    conversation: [
      {
        id: 'msg-201',
        sender: 'Havildar Pradeep Singh',
        senderRole: 'Beneficiary',
        timestamp: '2024-10-08 09:10',
        message: 'Dealer is asking Rs 15,000 logistic and handling charges which is against CSD guidelines. Please intervene.',
        attachments: ['Dealer_Debit_Note.jpg']
      },
      {
        id: 'msg-202',
        sender: 'Anita Sen (Helpdesk Supervisor)',
        senderRole: 'Helpdesk Supervisor',
        timestamp: '2024-10-10 10:00',
        message: 'Notice issued to Dealer DLR-UP-011 under CSD Rule 4.2. Handling charges are strictly prohibited. CSD HO is monitoring this case.',
        attachments: []
      }
    ]
  },
  {
    id: 'HD-2024-41105',
    subject: 'Clarification regarding Eligibility Quota under Revised 2024 Rules',
    category: 'Eligibility',
    subCategory: 'Pay Level Verification',
    severity: 'Medium',
    priority: 'P3',
    source: 'Telephone / Helpline',
    status: 'Resolved',
    escalationLevel: 1,
    escalationPath: [
      { level: 1, title: 'Helpdesk Agent (L1)', owner: 'Rakesh Verma', status: 'Completed', timestamp: '2024-10-12 15:00' },
      { level: 2, title: 'Technical Team (L2)', owner: '-', status: 'Pending', timestamp: null },
      { level: 3, title: 'Specialist / Dev (L3)', owner: '-', status: 'Pending', timestamp: null },
      { level: 4, title: 'CSD-HO Escalation (L4)', owner: '-', status: 'Pending', timestamp: null },
    ],
    userId: 'USR-BEN-005',
    userName: 'Naik Surender Pal',
    userRole: 'Beneficiary',
    serviceNumber: '14902122H',
    demandId: null,
    assignedAgentId: 'USR-HD-001',
    assignedAgentName: 'Rakesh Verma',
    assignedSupervisor: 'Anita Sen',
    createdDate: '2024-10-12 14:15',
    slaTargetDate: '2024-10-16 14:15',
    slaStatus: 'Within_SLA',
    slaHoursRemaining: 42,
    timeline: [
      { step: 'Created', by: 'Rakesh Verma (via Inbound Call)', date: '2024-10-12 14:15', note: 'Beneficiary phoned helpline inquiring about car eligibility limit' },
      { step: 'Resolved', by: 'Rakesh Verma', date: '2024-10-12 15:00', note: 'Explained Pay Level 5 eligibility cap of Rs 8 Lakhs (ex-showroom excluding GST).' },
    ],
    conversation: [
      {
        id: 'msg-301',
        sender: 'Naik Surender Pal',
        senderRole: 'Beneficiary',
        timestamp: '2024-10-12 14:15',
        message: 'I want to know if I can purchase a vehicle of Rs 10 Lakhs if I pay the difference amount myself.',
        attachments: []
      },
      {
        id: 'msg-302',
        sender: 'Rakesh Verma (Helpdesk Agent)',
        senderRole: 'Helpdesk',
        timestamp: '2024-10-12 15:00',
        message: 'Dear Beneficiary, as per MOD/CSD Policy Circular No. 98/2024, paying excess amount beyond rank entitlement is not permissible. The vehicle base price must strictly fall within your rank ceiling.',
        attachments: ['CSD_Entitlement_Circular_2024.pdf']
      }
    ]
  },
  {
    id: 'HD-2024-41112',
    subject: 'Aadhaar OTP Not Received During Registration',
    category: 'Portal Access',
    subCategory: 'OTP Delivery Failure',
    severity: 'Medium',
    priority: 'P3',
    source: 'Beneficiary Portal',
    status: 'Open',
    escalationLevel: 1,
    escalationPath: [
      { level: 1, title: 'Helpdesk Agent (L1)', owner: 'Unassigned', status: 'Current', timestamp: null },
      { level: 2, title: 'Technical Team (L2)', owner: '-', status: 'Pending', timestamp: null },
      { level: 3, title: 'Specialist / Dev (L3)', owner: '-', status: 'Pending', timestamp: null },
      { level: 4, title: 'CSD-HO Escalation (L4)', owner: '-', status: 'Pending', timestamp: null },
    ],
    userId: 'USR-BEN-006',
    userName: 'Sepoy Dilbag Singh',
    userRole: 'Beneficiary',
    serviceNumber: '16029311L',
    demandId: null,
    assignedAgentId: null,
    assignedAgentName: 'Unassigned',
    assignedSupervisor: 'Anita Sen',
    createdDate: '2024-10-14 09:30',
    slaTargetDate: '2024-10-15 09:30',
    slaStatus: 'Within_SLA',
    slaHoursRemaining: 23,
    timeline: [
      { step: 'Created', by: 'Sepoy Dilbag Singh', date: '2024-10-14 09:30', note: 'New user unable to complete Aadhaar e-KYC' },
    ],
    conversation: [
      {
        id: 'msg-401',
        sender: 'Sepoy Dilbag Singh',
        senderRole: 'Beneficiary',
        timestamp: '2024-10-14 09:30',
        message: 'I tried 4 times to register on AFD portal, but UIDAI OTP is not arriving on my registered mobile number.',
        attachments: []
      }
    ]
  }
];

export const MOCK_HELPDESK_METRICS = {
  openTickets: 24,
  pendingTickets: 12,
  assignedTickets: 18,
  escalatedTickets: 5,
  slaBreaches: 2,
  resolvedToday: 38,
  averageResolutionHours: 4.2,
  customerSatisfactionScore: 94.6, // percentage
  callRecordsToday: 142
};

export const MOCK_CALL_RECORDS = [
  { id: 'CALL-901', caller: 'Subedar Major Rajesh Kumar', number: '+91 98765 43210', duration: '4m 12s', category: 'Payment Verification', agent: 'Rakesh Verma', time: '2024-10-14 11:20', disposition: 'Resolved' },
  { id: 'CALL-902', caller: 'Col. V. Raman', number: '+91 98220 11223', duration: '6m 45s', category: 'Four-Wheeler Quota', agent: 'Rakesh Verma', time: '2024-10-14 10:40', disposition: 'Ticket Created' },
  { id: 'CALL-903', caller: 'Havildar T. B. Gurung', number: '+91 97110 55441', duration: '2m 18s', category: 'Login Trouble', agent: 'Sneha Roy', time: '2024-10-14 10:15', disposition: 'Resolved' },
];

export const MOCK_FEEDBACK = [
  { id: 'FB-101', ticketId: 'HD-2024-41105', rating: 5, comment: 'Very prompt reply by Rakesh Verma. Clarified policy on phone immediately.', date: '2024-10-12 16:30', user: 'Naik Surender Pal' },
  { id: 'FB-102', ticketId: 'HD-2024-39912', rating: 4, comment: 'Supply order released on the same day after verification. Good experience.', date: '2024-10-11 12:00', user: 'Subedar M. S. Gill' },
  { id: 'FB-103', ticketId: 'HD-2024-38810', rating: 5, comment: 'Clear portal instructions and helpful support.', date: '2024-10-09 17:15', user: 'Major Alok Nath' },
];
