import {
  LayoutDashboard,
  User,
  ShieldCheck,
  Package,
  FileText,
  Truck,
  CreditCard,
  Bell,
  HelpCircle,
  FileSpreadsheet,
  Settings,
  Users,
  Store,
  Layers,
  Building2,
  Warehouse,
  History,
  FileCheck,
  ShieldAlert,
  PhoneCall,
  MessageSquare,
  BookOpen,
  KeyRound,
  Image,
  UserCheck
} from 'lucide-react';
import { ROLES } from '../permissions/roles.js';

export const ROLE_SIDEBAR_NAV = {
  [ROLES.CS_DIRECTOR]: [
    { title: 'Registration Approvals', to: '/director/approvals', icon: UserCheck },
    { title: 'User Directory & Edits', to: '/director/beneficiaries', icon: Users },
  ],

  [ROLES.BENEFICIARY]: [
    // { title: 'Overview', to: '/beneficiary/dashboard', icon: LayoutDashboard },
    // { title: 'Eligibility Check', to: '/beneficiary/eligibility', icon: ShieldCheck },
    { title: 'My Demands', to: '/beneficiary/demands', icon: FileText },
    { title: 'Supply Orders', to: '/beneficiary/orders', icon: Truck },
    { title: 'Payments', to: '/beneficiary/payments', icon: CreditCard },
    { title: 'AFD Catalogue', to: '/beneficiary/products', icon: Package },
    { title: 'Profile & Records', to: '/beneficiary/profile', icon: User },
    { title: 'Documents', to: '/beneficiary/documents', icon: FileCheck },
    { title: 'Support Tickets', to: '/beneficiary/tickets', icon: HelpCircle },
    // { title: 'Notifications', to: '/beneficiary/notifications', icon: Bell },
    // { title: 'Settings', to: '/beneficiary/settings', icon: Settings }
  ],

  [ROLES.CSD]: [
    { title: 'HO Dashboard', to: '/csd/dashboard', icon: LayoutDashboard },
    { title: 'AFD Demands', to: '/csd/demands', icon: FileText },
    { title: 'Supply Orders', to: '/csd/orders', icon: Truck },
    { title: 'Treasury Payments', to: '/csd/payments', icon: CreditCard },
    { title: 'Beneficiary Registry', to: '/csd/beneficiaries', icon: Users },
    { title: 'User Management', to: '/csd/users', icon: User },
    { title: 'Product Catalogue', to: '/csd/products', icon: Package },
    { title: 'Categories & Quotas', to: '/csd/categories', icon: Layers },
    { title: 'OEM Partners', to: '/csd/oems', icon: Building2 },
    { title: 'Dealer Network', to: '/csd/dealers', icon: Store },
    { title: 'Regional Depots', to: '/csd/depots', icon: Warehouse },
    { title: 'URC Canteens', to: '/csd/urcs', icon: Store },
    { title: 'Reports & MIS', to: '/csd/reports', icon: FileSpreadsheet },
    { title: 'Audit Logs', to: '/csd/audit-logs', icon: ShieldAlert },
    { title: 'Login History', to: '/csd/login-history', icon: History },
    { title: 'Content & Circulars', to: '/csd/content', icon: FileCheck },
    { title: 'Helpdesk Oversight', to: '/csd/support', icon: HelpCircle },
    { title: 'Settings', to: '/csd/settings', icon: Settings }
  ],

  [ROLES.DEPOT]: [
    { title: 'Depot Dashboard', to: '/depot/dashboard', icon: LayoutDashboard },
    { title: 'Received Demands', to: '/depot/demands', icon: FileText },
    { title: 'Supply Orders', to: '/depot/orders', icon: Truck },
    { title: 'Allocated Products', to: '/depot/products', icon: Package },
    { title: 'Transactions', to: '/depot/transactions', icon: CreditCard },
    { title: 'Depot Reports', to: '/depot/reports', icon: FileSpreadsheet },
    { title: 'Notifications', to: '/depot/notifications', icon: Bell },
    { title: 'Support Desk', to: '/depot/support', icon: HelpCircle },
    { title: 'Depot Profile', to: '/depot/profile', icon: Warehouse }
  ],

  [ROLES.URC]: [
    { title: 'URC Dashboard', to: '/urc/dashboard', icon: LayoutDashboard },
    { title: 'Local Demands', to: '/urc/demands', icon: FileText },
    { title: 'Supply Orders', to: '/urc/orders', icon: Truck },
    { title: 'Entitled Products', to: '/urc/products', icon: Package },
    { title: 'URC Reports', to: '/urc/reports', icon: FileSpreadsheet },
    { title: 'Notifications', to: '/urc/notifications', icon: Bell },
    { title: 'Support', to: '/urc/support', icon: HelpCircle },
    { title: 'URC Profile', to: '/urc/profile', icon: Store }
  ],

  [ROLES.OEM]: [
    { title: 'OEM Dashboard', to: '/oem/dashboard', icon: LayoutDashboard },
    { title: 'Product Catalog', to: '/oem/products', icon: Package },
    { title: 'Authorized Dealers', to: '/oem/dealers', icon: Store },
    { title: 'Dealer Products', to: '/oem/dealer-products', icon: Layers },
    { title: 'State Pricing', to: '/oem/pricing', icon: CreditCard },
    { title: 'AFD Demands', to: '/oem/demands', icon: FileText },
    { title: 'Supply Orders', to: '/oem/orders', icon: Truck },
    { title: 'Reports & MIS', to: '/oem/reports', icon: FileSpreadsheet },
    { title: 'OEM Profile', to: '/oem/profile', icon: Building2 }
  ],

  [ROLES.DEALER]: [
    { title: 'Verification Desk', to: '/dealer/dashboard', icon: FileCheck },
    { title: 'Vehicle Handover', to: '/dealer/orders', icon: Truck },
    { title: 'Allotted Inventory', to: '/dealer/products', icon: Package },
    { title: 'Customer Deliveries', to: '/dealer/customers', icon: Users },
    { title: 'Delivery Proofs', to: '/dealer/documents', icon: FileCheck },
    { title: 'Dealer Reports', to: '/dealer/reports', icon: FileSpreadsheet },
    { title: 'Notifications', to: '/dealer/notifications', icon: Bell },
    { title: 'Support', to: '/dealer/support', icon: HelpCircle },
    { title: 'Showroom Profile', to: '/dealer/profile', icon: Store }
  ],

  [ROLES.HELPDESK_AGENT]: [
    { title: 'Agent Dashboard', to: '/helpdesk/dashboard', icon: LayoutDashboard },
    { title: 'All Tickets', to: '/helpdesk/tickets', icon: MessageSquare },
    { title: 'My Tickets', to: '/helpdesk/my-tickets', icon: FileText },
    { title: 'Unassigned Queue', to: '/helpdesk/unassigned', icon: HelpCircle },
    { title: 'Escalated Queue', to: '/helpdesk/escalated', icon: ShieldAlert },
    { title: 'Knowledge Base', to: '/helpdesk/knowledge-base', icon: BookOpen },
    { title: 'Portal FAQs', to: '/helpdesk/faqs', icon: FileCheck },
    { title: 'Call Records', to: '/helpdesk/call-records', icon: PhoneCall },
    { title: 'User Feedback', to: '/helpdesk/feedback', icon: MessageSquare },
    { title: 'SLA Reports', to: '/helpdesk/reports', icon: FileSpreadsheet },
    { title: 'Agent Profile', to: '/helpdesk/profile', icon: User }
  ],

  [ROLES.HELPDESK_SUPERVISOR]: [
    { title: 'Supervisor Dashboard', to: '/helpdesk/dashboard', icon: LayoutDashboard },
    { title: 'All Tickets Queue', to: '/helpdesk/tickets', icon: MessageSquare },
    { title: 'Unassigned Queue', to: '/helpdesk/unassigned', icon: HelpCircle },
    { title: 'Escalated (L2-L4)', to: '/helpdesk/escalated', icon: ShieldAlert },
    { title: 'Knowledge Base', to: '/helpdesk/knowledge-base', icon: BookOpen },
    { title: 'Portal FAQs', to: '/helpdesk/faqs', icon: FileCheck },
    { title: 'Call Records', to: '/helpdesk/call-records', icon: PhoneCall },
    { title: 'User Feedback', to: '/helpdesk/feedback', icon: MessageSquare },
    { title: 'SLA & Agent Reports', to: '/helpdesk/reports', icon: FileSpreadsheet },
    { title: 'Supervisor Profile', to: '/helpdesk/profile', icon: User }
  ],

  [ROLES.ADMIN]: [
    { title: 'HO Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'User Management', to: '/admin/users', icon: Users },
    { title: 'Product Catalog', to: '/csd/products', icon: Package },
    { title: 'Categories', to: '/csd/categories', icon: Layers },
    { title: 'OEMs / Manufacturers', to: '/csd/oems', icon: Building2 },
    { title: 'Dealer Network', to: '/csd/dealers', icon: Store },
    { title: 'Depot Management', to: '/csd/depots', icon: Warehouse },
    { title: 'URC Management', to: '/csd/urcs', icon: Store },
    { title: 'Demand Monitoring', to: '/csd/demands', icon: FileText },
    { title: 'Supply Orders', to: '/csd/orders', icon: Truck },
    { title: 'Payment Registry', to: '/csd/payments', icon: CreditCard },
    { title: 'Content & Banners', to: '/admin/banners', icon: Image },
    { title: 'Audit Logs', to: '/admin/audit-logs', icon: ShieldAlert },
    // { title: 'Authentication Logs', to: '/admin/authentication-logs', icon: History },
    // { title: 'System Alerts', to: '/admin/notifications', icon: Bell },
    // { title: 'Roles & Security', to: '/admin/roles', icon: ShieldCheck },
    { title: 'System Reports', to: '/admin/reports', icon: FileSpreadsheet },
    // { title: 'System Settings', to: '/admin/system-settings', icon: Settings },
  ]
};
