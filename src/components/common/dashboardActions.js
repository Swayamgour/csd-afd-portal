import {
  Users,
  FileText,
  Package,
  FileSpreadsheet,
  CreditCard,
  Truck,
  Store,
  Factory,
  MessageSquare,
  HelpCircle,
  ShieldAlert,
  BookOpen,
  FileCheck,
  Banknote,
  UserCheck,
  Building2,
} from 'lucide-react';

// Big, simple shortcuts shown at the top of every role dashboard.
// Routes match layouts/navConfig.js.
export const DASHBOARD_ACTIONS = {
  admin: [
    { label: 'Manage users', hint: 'Add, edit or suspend accounts', to: '/admin/users', icon: Users },
    { label: 'Watch demands', hint: 'See every AFD demand', to: '/csd/demands', icon: FileText, tone: 'info' },
    { label: 'Product catalogue', hint: 'Add or update products', to: '/csd/products', icon: Package, tone: 'success' },
    { label: 'System reports', hint: 'View and download reports', to: '/admin/reports', icon: FileSpreadsheet, tone: 'warning' },
  ],
  csd: [
    { label: 'Review demands', hint: 'Check demands waiting for action', to: '/csd/demands', icon: FileText },
    { label: 'Payments', hint: 'Track money received', to: '/csd/payments', icon: Banknote, tone: 'success' },
    { label: 'Beneficiaries', hint: 'Check registrations', to: '/csd/beneficiaries', icon: UserCheck, tone: 'info' },
    { label: 'MIS reports', hint: 'Download national reports', to: '/csd/reports', icon: FileSpreadsheet, tone: 'warning' },
  ],
  depot: [
    { label: 'Received demands', hint: 'Approve or reject demands', to: '/depot/demands', icon: FileText, tone: 'warning' },
    { label: 'Supply orders', hint: 'Track orders sent out', to: '/depot/orders', icon: Truck },
    { label: 'Transactions', hint: 'Check payment records', to: '/depot/transactions', icon: CreditCard, tone: 'success' },
    { label: 'Depot reports', hint: 'View and download reports', to: '/depot/reports', icon: FileSpreadsheet, tone: 'info' },
  ],
  urc: [
    { label: 'Local demands', hint: 'Demands from your station', to: '/urc/demands', icon: FileText, tone: 'warning' },
    { label: 'Supply orders', hint: 'Hand over and track orders', to: '/urc/orders', icon: Truck },
    { label: 'Entitled products', hint: 'See what can be ordered', to: '/urc/products', icon: Package, tone: 'success' },
    { label: 'URC reports', hint: 'View and download reports', to: '/urc/reports', icon: FileSpreadsheet, tone: 'info' },
  ],
  oem: [
    { label: 'My products', hint: 'Add or edit your catalogue', to: '/oem/products', icon: Factory },
    { label: 'Dealers', hint: 'See authorised dealers', to: '/oem/dealers', icon: Store, tone: 'info' },
    { label: 'State pricing', hint: 'Set prices by state', to: '/oem/pricing', icon: CreditCard, tone: 'success' },
    { label: 'Supply orders', hint: 'Track orders to deliver', to: '/oem/orders', icon: Truck, tone: 'warning' },
  ],
  helpdesk: [
    { label: 'All tickets', hint: 'Open the full queue', to: '/helpdesk/tickets', icon: MessageSquare },
    { label: 'Unassigned', hint: 'Pick up a new ticket', to: '/helpdesk/unassigned', icon: HelpCircle, tone: 'warning' },
    { label: 'Escalated', hint: 'Cases needing attention', to: '/helpdesk/escalated', icon: ShieldAlert, tone: 'danger' },
    { label: 'Knowledge base', hint: 'Find answers fast', to: '/helpdesk/knowledge-base', icon: BookOpen, tone: 'info' },
  ],
  beneficiary: [
    { label: 'Browse catalogue', hint: 'Choose a vehicle or item', to: '/beneficiary/products', icon: Package },
    { label: 'My demands', hint: 'Track your requests', to: '/beneficiary/demands', icon: FileText, tone: 'warning' },
    { label: 'Payments', hint: 'Pay or view receipts', to: '/beneficiary/payments', icon: CreditCard, tone: 'success' },
    { label: 'My documents', hint: 'Upload and check papers', to: '/beneficiary/documents', icon: FileCheck, tone: 'info' },
  ],
  dealer: [
    { label: 'Vehicle handover', hint: 'Deliver to beneficiaries', to: '/dealer/orders', icon: Truck },
    { label: 'Allotted inventory', hint: 'See your stock', to: '/dealer/products', icon: Package, tone: 'success' },
    { label: 'Delivery proofs', hint: 'Upload signed documents', to: '/dealer/documents', icon: FileCheck, tone: 'warning' },
    { label: 'Reports', hint: 'View and download reports', to: '/dealer/reports', icon: FileSpreadsheet, tone: 'info' },
  ],
};

export default DASHBOARD_ACTIONS;
