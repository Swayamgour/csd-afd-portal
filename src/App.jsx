import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout.jsx';
import { AppShell } from './layouts/AppShell.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { RoleRoute } from './routes/RoleRoute.jsx';
import { ROLES } from './permissions/roles.js';
import { LoadingState } from './components/common/States.jsx';

// Public Storefront Pages (100% Preserved)
const Home = lazy(() => import('./pages/Home.jsx'));
const Products = lazy(() => import('./pages/Products.jsx'));
const ProductDetails = lazy(() => import('./pages/ProductDetails.jsx'));
const Search = lazy(() => import('./pages/Search.jsx'));
const Compare = lazy(() => import('./pages/Compare.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const Cart = lazy(() => import('./pages/Cart.jsx'));
const Info = lazy(() => import('./pages/Info.jsx'));
const NotFound = lazy(() => import('./pages/NotFound.jsx'));
const Checkout = lazy(() => import('./pages/Checkout.jsx'));
const CheckoutSuccess = lazy(() => import('./pages/CheckoutSuccess.jsx'));
const Demands = lazy(() => import('./pages/Demands.jsx'));
const DemandDetail = lazy(() => import('./pages/DemandDetail.jsx'));

// Failsafe lazy-import helper supporting default exports, named exports, and mixed bundlers
const lazyImport = (importFn, name) =>
  lazy(() =>
    importFn().then((m) => {
      let comp = (name && m[name]) || m.default || m;
      if (comp && comp.default && typeof comp !== 'function') {
        comp = comp.default;
      }
      return { default: comp };
    })
  );

// Auth Security Pages
const PasswordReset = lazyImport(() => import('./features/auth/PasswordReset.jsx'), 'PasswordReset');
const Unauthorized = lazyImport(() => import('./features/auth/Unauthorized.jsx'), 'Unauthorized');
const SessionExpired = lazyImport(() => import('./features/auth/SessionExpired.jsx'), 'SessionExpired');

// 1. Beneficiary Pages
const BeneficiaryDashboard = lazyImport(() => import('./features/beneficiary/BeneficiaryDashboard.jsx'), 'BeneficiaryDashboard');
const BeneficiaryProfile = lazyImport(() => import('./features/beneficiary/BeneficiaryProfile.jsx'), 'BeneficiaryProfile');
const BeneficiaryEligibility = lazyImport(() => import('./features/beneficiary/BeneficiaryEligibility.jsx'), 'BeneficiaryEligibility');
const BeneficiaryProducts = lazyImport(() => import('./features/beneficiary/BeneficiaryProducts.jsx'), 'BeneficiaryProducts');
const BeneficiaryDemands = lazyImport(() => import('./features/beneficiary/BeneficiaryDemands.jsx'), 'BeneficiaryDemands');
const BeneficiaryDemandDetail = lazyImport(() => import('./features/beneficiary/BeneficiaryDemandDetail.jsx'), 'BeneficiaryDemandDetail');
const BeneficiaryCreateDemand = lazyImport(() => import('./features/beneficiary/BeneficiaryCreateDemand.jsx'), 'BeneficiaryCreateDemand');
const BeneficiaryOrders = lazyImport(() => import('./features/beneficiary/BeneficiaryOrders.jsx'), 'BeneficiaryOrders');
const BeneficiaryOrderDetail = lazyImport(() => import('./features/beneficiary/BeneficiaryOrderDetail.jsx'), 'BeneficiaryOrderDetail');
const BeneficiaryPayments = lazyImport(() => import('./features/beneficiary/BeneficiaryPayments.jsx'), 'BeneficiaryPayments');
const BeneficiaryNotifications = lazyImport(() => import('./features/beneficiary/BeneficiaryNotifications.jsx'), 'BeneficiaryNotifications');
const BeneficiaryDocuments = lazyImport(() => import('./features/beneficiary/BeneficiaryDocuments.jsx'), 'BeneficiaryDocuments');
const BeneficiaryTickets = lazyImport(() => import('./features/beneficiary/BeneficiaryTickets.jsx'), 'BeneficiaryTickets');
const BeneficiarySettings = lazyImport(() => import('./features/beneficiary/BeneficiarySettings.jsx'), 'BeneficiarySettings');

// 2. CSD-HO Official Pages (HQ Directorate)
const CsdDashboard = lazyImport(() => import('./features/csd/CsdDashboard.jsx'), 'CsdDashboard');
const CsdUsers = lazyImport(() => import('./features/csd/CsdUsers.jsx'), 'CsdUsers');
const CsdBeneficiaries = lazyImport(() => import('./features/csd/CsdBeneficiaries.jsx'), 'CsdBeneficiaries');
const CsdProducts = lazyImport(() => import('./features/csd/CsdProducts.jsx'), 'CsdProducts');
const CsdCategories = lazyImport(() => import('./features/csd/CsdCategories.jsx'), 'CsdCategories');
const CsdOems = lazyImport(() => import('./features/csd/CsdOems.jsx'), 'CsdOems');
const CsdDealers = lazyImport(() => import('./features/csd/CsdDealers.jsx'), 'CsdDealers');
const CsdDepots = lazyImport(() => import('./features/csd/CsdDepots.jsx'), 'CsdDepots');
const CsdDemands = lazyImport(() => import('./features/csd/CsdDemands.jsx'), 'CsdDemands');
const CsdOrders = lazyImport(() => import('./features/csd/CsdOrders.jsx'), 'CsdOrders');
const CsdPayments = lazyImport(() => import('./features/csd/CsdPayments.jsx'), 'CsdPayments');
const CsdReports = lazyImport(() => import('./features/csd/CsdReports.jsx'), 'CsdReports');
const CsdAuditLogs = lazyImport(() => import('./features/csd/CsdAuditLogs.jsx'), 'CsdAuditLogs');
const CsdLoginHistory = lazyImport(() => import('./features/csd/CsdLoginHistory.jsx'), 'CsdLoginHistory');
const CsdNotifications = lazyImport(() => import('./features/csd/CsdNotifications.jsx'), 'CsdNotifications');
const CsdContent = lazyImport(() => import('./features/csd/CsdContent.jsx'), 'CsdContent');
const CsdSupport = lazyImport(() => import('./features/csd/CsdSupport.jsx'), 'CsdSupport');
const CsdSettings = lazyImport(() => import('./features/csd/CsdSettings.jsx'), 'CsdSettings');

// 3. Depot Pages
const DepotDashboard = lazyImport(() => import('./features/depot/DepotDashboard.jsx'), 'DepotDashboard');
const DepotDemands = lazyImport(() => import('./features/depot/DepotDemands.jsx'), 'DepotDemands');
const DepotOrders = lazyImport(() => import('./features/depot/DepotOrders.jsx'), 'DepotOrders');
const DepotProducts = lazyImport(() => import('./features/depot/DepotProducts.jsx'), 'DepotProducts');
const DepotTransactions = lazyImport(() => import('./features/depot/DepotTransactions.jsx'), 'DepotTransactions');
const DepotReports = lazyImport(() => import('./features/depot/DepotReports.jsx'), 'DepotReports');
const DepotNotifications = lazyImport(() => import('./features/depot/DepotNotifications.jsx'), 'DepotNotifications');
const DepotSupport = lazyImport(() => import('./features/depot/DepotSupport.jsx'), 'DepotSupport');
const DepotProfile = lazyImport(() => import('./features/depot/DepotProfile.jsx'), 'DepotProfile');

// 4. URC Pages
const UrcDashboard = lazyImport(() => import('./features/urc/UrcDashboard.jsx'), 'UrcDashboard');
const UrcProducts = lazyImport(() => import('./features/urc/UrcProducts.jsx'), 'UrcProducts');
const UrcDemands = lazyImport(() => import('./features/urc/UrcDemands.jsx'), 'UrcDemands');
const UrcOrders = lazyImport(() => import('./features/urc/UrcOrders.jsx'), 'UrcOrders');
const UrcReports = lazyImport(() => import('./features/urc/UrcReports.jsx'), 'UrcReports');
const UrcNotifications = lazyImport(() => import('./features/urc/UrcNotifications.jsx'), 'UrcNotifications');
const UrcSupport = lazyImport(() => import('./features/urc/UrcSupport.jsx'), 'UrcSupport');
const UrcProfile = lazyImport(() => import('./features/urc/UrcProfile.jsx'), 'UrcProfile');

// 5. OEM Pages
const OemDashboard = lazyImport(() => import('./features/oem/OemDashboard.jsx'), 'OemDashboard');
const OemProducts = lazyImport(() => import('./features/oem/OemProducts.jsx'), 'OemProducts');
const OemOrders = lazyImport(() => import('./features/oem/OemOrders.jsx'), 'OemOrders');
const OemDemands = lazyImport(() => import('./features/oem/OemDemands.jsx'), 'OemDemands');
const OemDocuments = lazyImport(() => import('./features/oem/OemDocuments.jsx'), 'OemDocuments');
const OemReports = lazyImport(() => import('./features/oem/OemReports.jsx'), 'OemReports');
const OemNotifications = lazyImport(() => import('./features/oem/OemNotifications.jsx'), 'OemNotifications');
const OemSupport = lazyImport(() => import('./features/oem/OemSupport.jsx'), 'OemSupport');
const OemProfile = lazyImport(() => import('./features/oem/OemProfile.jsx'), 'OemProfile');

// 6. Dealer Pages
const DealerDashboard = lazyImport(() => import('./features/dealer/DealerDashboard.jsx'), 'DealerDashboard');
const DealerProducts = lazyImport(() => import('./features/dealer/DealerProducts.jsx'), 'DealerProducts');
const DealerOrders = lazyImport(() => import('./features/dealer/DealerOrders.jsx'), 'DealerOrders');
const DealerCustomers = lazyImport(() => import('./features/dealer/DealerCustomers.jsx'), 'DealerCustomers');
const DealerDocuments = lazyImport(() => import('./features/dealer/DealerDocuments.jsx'), 'DealerDocuments');
const DealerReports = lazyImport(() => import('./features/dealer/DealerReports.jsx'), 'DealerReports');
const DealerNotifications = lazyImport(() => import('./features/dealer/DealerNotifications.jsx'), 'DealerNotifications');
const DealerSupport = lazyImport(() => import('./features/dealer/DealerSupport.jsx'), 'DealerSupport');
const DealerProfile = lazyImport(() => import('./features/dealer/DealerProfile.jsx'), 'DealerProfile');

// 7. Helpdesk Pages
const HelpdeskDashboard = lazyImport(() => import('./features/helpdesk/HelpdeskDashboard.jsx'), 'HelpdeskDashboard');
const HelpdeskTickets = lazyImport(() => import('./features/helpdesk/HelpdeskTickets.jsx'), 'HelpdeskTickets');
const HelpdeskTicketDetail = lazyImport(() => import('./features/helpdesk/HelpdeskTicketDetail.jsx'), 'HelpdeskTicketDetail');
const HelpdeskMyTickets = lazyImport(() => import('./features/helpdesk/HelpdeskQueues.jsx'), 'HelpdeskMyTickets');
const HelpdeskUnassigned = lazyImport(() => import('./features/helpdesk/HelpdeskQueues.jsx'), 'HelpdeskUnassigned');
const HelpdeskEscalated = lazyImport(() => import('./features/helpdesk/HelpdeskQueues.jsx'), 'HelpdeskEscalated');
const HelpdeskKnowledgeBase = lazyImport(() => import('./features/helpdesk/HelpdeskKnowledgeBase.jsx'), 'HelpdeskKnowledgeBase');
const HelpdeskArticleDetail = lazyImport(() => import('./features/helpdesk/HelpdeskArticleDetail.jsx'), 'HelpdeskArticleDetail');
const HelpdeskFaqs = lazyImport(() => import('./features/helpdesk/HelpdeskFaqs.jsx'), 'HelpdeskFaqs');
const HelpdeskReports = lazyImport(() => import('./features/helpdesk/HelpdeskReports.jsx'), 'HelpdeskReports');
const HelpdeskCallRecords = lazyImport(() => import('./features/helpdesk/HelpdeskCallRecords.jsx'), 'HelpdeskCallRecords');
const HelpdeskFeedback = lazyImport(() => import('./features/helpdesk/HelpdeskFeedback.jsx'), 'HelpdeskFeedback');
const HelpdeskProfile = lazyImport(() => import('./features/helpdesk/HelpdeskProfile.jsx'), 'HelpdeskProfile');

// 8. Admin Pages
const AdminDashboard = lazyImport(() => import('./features/admin/AdminDashboard.jsx'), 'AdminDashboard');
const AdminUsers = lazyImport(() => import('./features/admin/AdminUsers.jsx'), 'AdminUsers');
const AdminAddUser = lazyImport(() => import('./features/admin/AdminAddUser.jsx'), 'AdminAddUser');
const AdminRoles = lazyImport(() => import('./features/admin/AdminRoles.jsx'), 'AdminRoles');
const AdminPermissions = lazyImport(() => import('./features/admin/AdminPermissions.jsx'), 'AdminPermissions');
const AdminSystemSettings = lazyImport(() => import('./features/admin/AdminSystemSettings.jsx'), 'AdminSystemSettings');
const AdminAuditLogs = lazyImport(() => import('./features/admin/AdminAuditLogs.jsx'), 'AdminAuditLogs');
const AdminAuthenticationLogs = lazyImport(() => import('./features/admin/AdminAuthenticationLogs.jsx'), 'AdminAuthenticationLogs');
const AdminNotifications = lazyImport(() => import('./features/admin/AdminNotifications.jsx'), 'AdminNotifications');
const AdminReports = lazyImport(() => import('./features/admin/AdminReports.jsx'), 'AdminReports');
const AdminSecurity = lazyImport(() => import('./features/admin/AdminSecurity.jsx'), 'AdminSecurity');
const AdminProfile = lazyImport(() => import('./features/admin/AdminProfile.jsx'), 'AdminProfile');

export default function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <Suspense fallback={<LoadingState text="Loading certified portal module..." />}>
      <Routes>
        {/* PUBLIC STOREFRONT LAYER */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/search" element={<Search />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/categories" element={<Products />} />
          <Route path="/register" element={<Register />} />
          <Route path="/info/:topic" element={<Info />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />
          <Route path="/demands" element={<Demands />} />
          <Route path="/demands/:id" element={<DemandDetail />} />
          <Route path="/payment/:demandId" element={<DemandDetail />} />


          {/* AUTH SECURITY LAYER */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<PasswordReset />} />
          <Route path="/reset-password" element={<PasswordReset />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/session-expired" element={<SessionExpired />} />

        </Route>

        {/* =========================================================
            AUTHENTICATED ENTERPRISE PORTAL (Wrapped in AppShell)
            ========================================================= */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>

          {/* 1. BENEFICIARY PORTAL */}
          <Route path="/beneficiary/dashboard" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryDashboard /></RoleRoute>} />
          <Route path="/beneficiary/profile" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryProfile /></RoleRoute>} />
          <Route path="/beneficiary/eligibility" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryEligibility /></RoleRoute>} />
          <Route path="/beneficiary/products" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryProducts /></RoleRoute>} />
          <Route path="/beneficiary/demands" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryDemands /></RoleRoute>} />
          <Route path="/beneficiary/demands/new" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryCreateDemand /></RoleRoute>} />
          <Route path="/beneficiary/demands/:id" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryDemandDetail /></RoleRoute>} />
          <Route path="/beneficiary/orders" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryOrders /></RoleRoute>} />
          <Route path="/beneficiary/orders/:id" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryOrderDetail /></RoleRoute>} />
          <Route path="/beneficiary/payments" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryPayments /></RoleRoute>} />
          <Route path="/beneficiary/notifications" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryNotifications /></RoleRoute>} />
          <Route path="/beneficiary/documents" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryDocuments /></RoleRoute>} />
          <Route path="/beneficiary/support" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryTickets /></RoleRoute>} />
          <Route path="/beneficiary/tickets" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiaryTickets /></RoleRoute>} />
          <Route path="/beneficiary/settings" element={<RoleRoute allowedRoles={[ROLES.BENEFICIARY]}><BeneficiarySettings /></RoleRoute>} />

          {/* 2. CSD-HO OFFICIAL PORTAL */}
          <Route path="/csd/dashboard" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdDashboard /></RoleRoute>} />
          <Route path="/csd/users" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdUsers /></RoleRoute>} />
          <Route path="/csd/beneficiaries" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdBeneficiaries /></RoleRoute>} />
          <Route path="/csd/products" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdProducts /></RoleRoute>} />
          <Route path="/csd/categories" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdCategories /></RoleRoute>} />
          <Route path="/csd/oems" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdOems /></RoleRoute>} />
          <Route path="/csd/dealers" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdDealers /></RoleRoute>} />
          <Route path="/csd/depots" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdDepots /></RoleRoute>} />
          <Route path="/csd/demands" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdDemands /></RoleRoute>} />
          <Route path="/csd/orders" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdOrders /></RoleRoute>} />
          <Route path="/csd/payments" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdPayments /></RoleRoute>} />
          <Route path="/csd/reports" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdReports /></RoleRoute>} />
          <Route path="/csd/audit-logs" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdAuditLogs /></RoleRoute>} />
          <Route path="/csd/login-history" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdLoginHistory /></RoleRoute>} />
          <Route path="/csd/notifications" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdNotifications /></RoleRoute>} />
          <Route path="/csd/content" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdContent /></RoleRoute>} />
          <Route path="/csd/support" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdSupport /></RoleRoute>} />
          <Route path="/csd/settings" element={<RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}><CsdSettings /></RoleRoute>} />

          {/* 3. DEPOT OFFICIAL PORTAL */}
          <Route path="/depot/dashboard" element={<RoleRoute allowedRoles={[ROLES.DEPOT_OFFICIAL]}><DepotDashboard /></RoleRoute>} />
          <Route path="/depot/demands" element={<RoleRoute allowedRoles={[ROLES.DEPOT_OFFICIAL]}><DepotDemands /></RoleRoute>} />
          <Route path="/depot/orders" element={<RoleRoute allowedRoles={[ROLES.DEPOT_OFFICIAL]}><DepotOrders /></RoleRoute>} />
          <Route path="/depot/products" element={<RoleRoute allowedRoles={[ROLES.DEPOT_OFFICIAL]}><DepotProducts /></RoleRoute>} />
          <Route path="/depot/transactions" element={<RoleRoute allowedRoles={[ROLES.DEPOT_OFFICIAL]}><DepotTransactions /></RoleRoute>} />
          <Route path="/depot/reports" element={<RoleRoute allowedRoles={[ROLES.DEPOT_OFFICIAL]}><DepotReports /></RoleRoute>} />
          <Route path="/depot/notifications" element={<RoleRoute allowedRoles={[ROLES.DEPOT_OFFICIAL]}><DepotNotifications /></RoleRoute>} />
          <Route path="/depot/support" element={<RoleRoute allowedRoles={[ROLES.DEPOT_OFFICIAL]}><DepotSupport /></RoleRoute>} />
          <Route path="/depot/profile" element={<RoleRoute allowedRoles={[ROLES.DEPOT_OFFICIAL]}><DepotProfile /></RoleRoute>} />

          {/* 4. URC PORTAL */}
          <Route path="/urc/dashboard" element={<RoleRoute allowedRoles={[ROLES.URC_USER]}><UrcDashboard /></RoleRoute>} />
          <Route path="/urc/products" element={<RoleRoute allowedRoles={[ROLES.URC_USER]}><UrcProducts /></RoleRoute>} />
          <Route path="/urc/demands" element={<RoleRoute allowedRoles={[ROLES.URC_USER]}><UrcDemands /></RoleRoute>} />
          <Route path="/urc/orders" element={<RoleRoute allowedRoles={[ROLES.URC_USER]}><UrcOrders /></RoleRoute>} />
          <Route path="/urc/reports" element={<RoleRoute allowedRoles={[ROLES.URC_USER]}><UrcReports /></RoleRoute>} />
          <Route path="/urc/notifications" element={<RoleRoute allowedRoles={[ROLES.URC_USER]}><UrcNotifications /></RoleRoute>} />
          <Route path="/urc/support" element={<RoleRoute allowedRoles={[ROLES.URC_USER]}><UrcSupport /></RoleRoute>} />
          <Route path="/urc/profile" element={<RoleRoute allowedRoles={[ROLES.URC_USER]}><UrcProfile /></RoleRoute>} />

          {/* 5. OEM PORTAL */}
          <Route path="/oem/dashboard" element={<RoleRoute allowedRoles={[ROLES.OEM_USER]}><OemDashboard /></RoleRoute>} />
          <Route path="/oem/products" element={<RoleRoute allowedRoles={[ROLES.OEM_USER]}><OemProducts /></RoleRoute>} />
          <Route path="/oem/orders" element={<RoleRoute allowedRoles={[ROLES.OEM_USER]}><OemOrders /></RoleRoute>} />
          <Route path="/oem/demands" element={<RoleRoute allowedRoles={[ROLES.OEM_USER]}><OemDemands /></RoleRoute>} />
          <Route path="/oem/documents" element={<RoleRoute allowedRoles={[ROLES.OEM_USER]}><OemDocuments /></RoleRoute>} />
          <Route path="/oem/reports" element={<RoleRoute allowedRoles={[ROLES.OEM_USER]}><OemReports /></RoleRoute>} />
          <Route path="/oem/notifications" element={<RoleRoute allowedRoles={[ROLES.OEM_USER]}><OemNotifications /></RoleRoute>} />
          <Route path="/oem/support" element={<RoleRoute allowedRoles={[ROLES.OEM_USER]}><OemSupport /></RoleRoute>} />
          <Route path="/oem/profile" element={<RoleRoute allowedRoles={[ROLES.OEM_USER]}><OemProfile /></RoleRoute>} />

          {/* 6. DEALER PORTAL */}
          <Route path="/dealer/dashboard" element={<RoleRoute allowedRoles={[ROLES.DEALER_USER]}><DealerDashboard /></RoleRoute>} />
          <Route path="/dealer/products" element={<RoleRoute allowedRoles={[ROLES.DEALER_USER]}><DealerProducts /></RoleRoute>} />
          <Route path="/dealer/orders" element={<RoleRoute allowedRoles={[ROLES.DEALER_USER]}><DealerOrders /></RoleRoute>} />
          <Route path="/dealer/customers" element={<RoleRoute allowedRoles={[ROLES.DEALER_USER]}><DealerCustomers /></RoleRoute>} />
          <Route path="/dealer/documents" element={<RoleRoute allowedRoles={[ROLES.DEALER_USER]}><DealerDocuments /></RoleRoute>} />
          <Route path="/dealer/reports" element={<RoleRoute allowedRoles={[ROLES.DEALER_USER]}><DealerReports /></RoleRoute>} />
          <Route path="/dealer/notifications" element={<RoleRoute allowedRoles={[ROLES.DEALER_USER]}><DealerNotifications /></RoleRoute>} />
          <Route path="/dealer/support" element={<RoleRoute allowedRoles={[ROLES.DEALER_USER]}><DealerSupport /></RoleRoute>} />
          <Route path="/dealer/profile" element={<RoleRoute allowedRoles={[ROLES.DEALER_USER]}><DealerProfile /></RoleRoute>} />

          {/* 7. HELPDESK PORTAL */}
          <Route path="/helpdesk/dashboard" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskDashboard /></RoleRoute>} />
          <Route path="/helpdesk/tickets" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskTickets /></RoleRoute>} />
          <Route path="/helpdesk/tickets/:id" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskTicketDetail /></RoleRoute>} />
          <Route path="/helpdesk/my-tickets" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskMyTickets /></RoleRoute>} />
          <Route path="/helpdesk/unassigned" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskUnassigned /></RoleRoute>} />
          <Route path="/helpdesk/escalated" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskEscalated /></RoleRoute>} />
          <Route path="/helpdesk/knowledge-base" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskKnowledgeBase /></RoleRoute>} />
          <Route path="/helpdesk/knowledge-base/:id" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskArticleDetail /></RoleRoute>} />
          <Route path="/helpdesk/faqs" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskFaqs /></RoleRoute>} />
          <Route path="/helpdesk/reports" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskReports /></RoleRoute>} />
          <Route path="/helpdesk/call-records" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskCallRecords /></RoleRoute>} />
          <Route path="/helpdesk/feedback" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskFeedback /></RoleRoute>} />
          <Route path="/helpdesk/profile" element={<RoleRoute allowedRoles={[ROLES.HELPDESK_AGENT, ROLES.HELPDESK_SUPERVISOR]}><HelpdeskProfile /></RoleRoute>} />

          {/* 8. SYSTEM ADMINISTRATOR PORTAL */}
          <Route path="/admin/dashboard" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminDashboard /></RoleRoute>} />
          <Route path="/admin/users" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminUsers /></RoleRoute>} />
          <Route path="/admin/users/new" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminAddUser /></RoleRoute>} />
          <Route path="/admin/roles" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminRoles /></RoleRoute>} />
          <Route path="/admin/permissions" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminPermissions /></RoleRoute>} />
          <Route path="/admin/system-settings" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminSystemSettings /></RoleRoute>} />
          <Route path="/admin/audit-logs" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminAuditLogs /></RoleRoute>} />
          <Route path="/admin/authentication-logs" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminAuthenticationLogs /></RoleRoute>} />
          <Route path="/admin/notifications" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminNotifications /></RoleRoute>} />
          <Route path="/admin/reports" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminReports /></RoleRoute>} />
          <Route path="/admin/security" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminSecurity /></RoleRoute>} />
          <Route path="/admin/profile" element={<RoleRoute allowedRoles={[ROLES.ADMIN]}><AdminProfile /></RoleRoute>} />

        </Route>

        {/* 404 NOT FOUND */}
        <Route path="*" element={<PublicLayout><NotFound /></PublicLayout>} />
      </Routes>
    </Suspense>
  );
}
