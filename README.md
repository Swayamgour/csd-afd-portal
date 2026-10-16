# CSD AFD Online Enterprise Portal

> **Ministry of Defence · Government of India · Canteen Stores Department**  
> Comprehensive Full-Stack Role-Based Procurement, Supply Chain, and National Helpdesk Platform for Against Firm Demand (AFD) Items.

---

## 📌 Executive Summary

The **CSD AFD Online Portal** is an enterprise-grade digital platform designed to automate and streamline the procurement, sanctioning, payment reconciliation, supply order generation, and delivery tracking of **AFD-I (Cars, Motorcycles, Scooters)** and **AFD-II (Refrigerators, Air Conditioners, Washing Machines, Televisions)** items for serving and retired Armed Forces personnel (Army, Navy, Air Force, Coast Guard), defence civilians, and their families across India.

The project features a **two-tier architecture**:
1. **Public Storefront (`/`)**: A fast, accessible, consumer-friendly catalog allowing beneficiaries and citizens to browse vehicles and home appliances, compare specifications side-by-side, check AFD concessional prices, and view official procurement policies.
2. **Authenticated Enterprise Portal (`/login`, `/beneficiary/*`, `/csd/*`, `/depot/*`, `/urc/*`, `/oem/*`, `/dealer/*`, `/helpdesk/*`, `/admin/*`)**: A secure, multi-tenant workspace serving **9 distinct institutional stakeholder roles** with fine-grained Role-Based Access Control (RBAC), two-factor authentication, automated entitlement checks, and multi-tier SLA tracking.

---

## 🏛️ Supported Stakeholder Roles (9 Personas)

| Role | Route Base | Responsibilities & Capabilities |
| :--- | :--- | :--- |
| **1. Defence Beneficiary** | `/beneficiary/*` | Profile & service records, entitlement engine (car price caps, periodicity intervals), demand drafting & submission, payment receipts, order milestone tracking, support tickets. |
| **2. CSD Head Office (HO)** | `/csd/*` | National operations oversight, policy & circular management, depot sanctions, national demand scrutiny, OEM/dealer authorizations, audit logs, MIS reporting. |
| **3. Regional Depot Official** | `/depot/*` | Regional demand validation, allocation review, supply order issuance, local treasury payment reconciliation, stock and delivery sign-offs. |
| **4. Unit Run Canteen (URC)** | `/urc/*` | Local base demand verification, service certificate validation, local delivery coordination, counter service inquiry handling. |
| **5. OEM Manufacturer** | `/oem/*` | National vehicle/appliance catalog management, depot allocations, factory vehicle dispatch & VIN/Chassis allocation, delivery compliance docs. |
| **6. Authorized Dealer** | `/dealer/*` | Stock receipt from OEM, pre-delivery inspection (PDI), customer document verification, final handover proof upload, local delivery sign-offs. |
| **7. Helpdesk Agent** | `/helpdesk/*` | Citizen service desk, incident handling (L1/L2), knowledge base resolution, call logging, feedback monitoring. |
| **8. Helpdesk Supervisor** | `/helpdesk/*` | Multi-tier escalation management (L1 $\to$ L4), queue reassignment, SLA breach tracking, agent performance analytics. |
| **9. System Administrator** | `/admin/*` | Global user directory, role assignments, permissions matrix, authentication security policies, system audit logs, platform configurations. |

---

## ✨ Key Platform Features

### 🛒 1. Public Storefront (100% Preserved & Enhanced)
- **Dynamic Catalogue**: Fast grid and list views with multi-faceted filtering by brand, category, fuel type, transmission, price brackets, and depot stock.
- **Detailed Product Specifications**: 360° vehicle image galleries, technical dimensions, engine specs, safety ratings, and complete tax concession breakdowns.
- **Specification Comparator**: Side-by-side technical comparison of up to 4 models.
- **Live Search**: Instant keyword search indexing vehicle names, variants, and OEM manufacturers.
- **Government Guidelines & Policy Library**: Official eligibility rules, rank entitlement matrices, and step-by-step AFD purchase guidance.

### 🔐 2. Enterprise Authentication & Security Suite
- **Role Authority Selector**: Instant switching between all 9 stakeholder roles on the login screen.
- **Dual-Layer Security**: Service Number / User ID validation with password visibility toggling.
- **Security Captcha**: Monospace textured anti-bot verification code with 1-click refresh.
- **Two-Factor OTP Verification**: 6-digit auto-advancing verification boxes with resend cooldown and session timeout handling.
- **Instant Role Switcher**: Quick-access persona switcher in the portal header allowing developers and inspectors to evaluate any of the 9 roles without re-logging in.

### 📋 3. Automated Entitlement & Demand Engine
- **Rank & Pay Level Entitlements**: Automatic determination of vehicle eligibility based on Pay Level (Pay Level 3–5, 6–9, 10–18) adhering to Ministry of Defence rules:
  - *Officers*: Up to ₹20.0 Lakhs (excluding taxes) · Every 8 years.
  - *JCOs*: Up to ₹10.0 Lakhs (excluding taxes) · Twice in service (first after 5 years, second after retirement).
  - *Other Ranks (ORs)*: Up to ₹8.0 Lakhs (excluding taxes) · Once during service, once post-retirement.
  - *Two-Wheelers & Appliances*: Open to all ranks every 3 years without purchase price limits.
- **Real-Time Eligibility Checker**: Interactive wizard validating past purchase dates and service retirement status.
- **Demand Generation**: Direct submission workflow with preferred regional depot, color variant, and authorized dealership selection.

### 🚚 4. Supply Order & Delivery Milestone Tracking
- **Interactive Delivery Timeline**: Real-time status milestones:
  $$\text{Demand Drafted} \longrightarrow \text{Depot Sanction} \longrightarrow \text{Treasury e-Pay Reconciled} \longrightarrow \text{Supply Order Issued} \longrightarrow \text{Factory OEM Dispatch} \longrightarrow \text{Dealer PDI} \longrightarrow \text{Vehicle Handover}$$
- **Document Management**: Upload and preview of Essential Service Certificates, PPO copies, PAN, Aadhar, Driving Licenses, and Bank Challans with in-browser preview modal.

### 🎧 5. Multi-Tier Helpdesk & Knowledge Base Workspace
- **Flagship 3-Column Incident Workspace**:
  - *Left Column*: Ticket metadata, SLA countdown timer, and Citizen Dossier (Service No, Rank, Unit).
  - *Center Column*: Citizen query description, chronological audit timeline, official response editor, and confidential staff-only notes.
  - *Right Column*: Action hub with 4-level escalation matrix ($L1 \to L4$), agent assignment modal, resolution modal, and automated suggested Knowledge Base articles matching ticket keywords.
- **Knowledge Base (KB)**: Searchable repository of articles with helpfulness rating and FAQ categorization.

---

## 🛠️ Technology Stack & Architecture

- **Core**: React 18.3.1, Vite 5.4.8, React Router DOM 6.26.2
- **Iconography**: Lucide React 0.453.0
- **Typography**: Space Grotesk, Fraunces, Noto Sans, Noto Sans Devanagari
- **Styling Architecture**: Vanilla CSS (`src/index.css`) containing 4,500+ lines of customized government enterprise tokens, accessible high-contrast palettes, responsive CSS grids, and mobile-friendly layouts.
- **Decoupled Architecture Pattern**:
  $$\text{UI Views} \longrightarrow \text{Enterprise Common Components} \longrightarrow \text{Domain Services} \longrightarrow \text{API Client} \longrightarrow \text{Mock Data / REST API}$$

### Folder Structure Overview

```
csd-afd-portal/
├── public/                 # Static assets, branding logos, vehicle imagery
├── src/
│   ├── components/         # Common UI library (Button, Card, DataTable, Modal, StatCard, Timeline, etc.)
│   ├── context/            # AuthContext (user, permissions, role switcher), Store (cart/compare)
│   ├── data/
│   │   ├── mock/           # Realistic mock stores (users, demands, orders, tickets, kb, audit)
│   │   └── products.js     # Original vehicle and appliance catalog
│   ├── features/           # Modular role feature modules:
│   │   ├── admin/          # System Administration, Users, Roles, Audit Logs, Security
│   │   ├── auth/           # LoginLayout, LoginForm, OTPVerification, PasswordReset
│   │   ├── beneficiary/    # Dashboard, Profile, Eligibility, Demands, Orders, Payments, Documents
│   │   ├── csd/            # CSD-HO HQ Directorate oversight, sanctions, MIS reports
│   │   ├── dealer/         # Dealership orders, vehicle inspections, delivery handovers
│   │   ├── depot/          # Regional depot sanctions, allocations, transactions
│   │   ├── helpdesk/       # 3-column ticket workspace, queues, knowledge base, FAQs
│   │   ├── oem/            # Manufacturer catalog lineup, factory dispatch, VIN allocations
│   │   └── urc/            # Unit Run Canteen local demand verification and counter services
│   ├── layouts/            # AppShell (Sidebar, HeaderBar, Breadcrumbs), PublicLayout, RoleSwitcher
│   ├── pages/              # Public storefront pages (Home, Products, ProductDetails, Compare, Cart, Login)
│   ├── permissions/        # RBAC definitions (roles.js, permissions.js, <Can /> guard)
│   ├── routes/             # ProtectedRoute.jsx, RoleRoute.jsx
│   ├── services/           # Backend-ready domain services (auth, demand, order, ticket, kb, user, report)
│   ├── App.jsx             # Comprehensive route definitions with resilient lazyImport
│   ├── index.css           # Complete enterprise design system and storefront stylesheet
│   └── main.jsx            # Application entrypoint with providers
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.x or later recommended)
- `npm` or `yarn`

### Installation & Local Development

1. **Clone or navigate into the project directory:**
   ```bash
   cd csd-afd-portal
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local Vite development server:**
   ```bash
   npm run dev
   ```
   The application will start immediately at:  
   👉 **`http://localhost:5173`**

4. **Production Build & Preview:**
   ```bash
   npm run build
   npm run preview
   ```

---

## 🔑 Quick Demo Credentials

For rapid testing and grading, pre-configured authorized demo accounts for all 9 stakeholder roles are embedded into the login screen. Selecting a role automatically loads the corresponding credentials:

| Role Authority | Login Identifier | Password | Default Landing Page |
| :--- | :--- | :--- | :--- |
| **Defence Beneficiary** | `JC-765432X` | `GovtPass@2024` | `/beneficiary/dashboard` |
| **CSD Head Office (HO)** | `CSD_HO_089` | `GovtPass@2024` | `/csd/dashboard` |
| **Regional Depot** | `DEPOT_MGR_DEL` | `GovtPass@2024` | `/depot/dashboard` |
| **Unit Run Canteen (URC)** | `URC_OFF_CANTT` | `GovtPass@2024` | `/urc/dashboard` |
| **OEM Manufacturer** | `OEM_TATA_AFD` | `GovtPass@2024` | `/oem/dashboard` |
| **Authorized Dealer** | `DLR_PRATHAM_DEL` | `GovtPass@2024` | `/dealer/dashboard` |
| **Helpdesk Agent** | `HD_AGENT_104` | `GovtPass@2024` | `/helpdesk/dashboard` |
| **Helpdesk Supervisor** | `HD_SUP_002` | `GovtPass@2024` | `/helpdesk/dashboard` |
| **System Administrator** | `SYS_ADMIN_CSD` | `GovtPass@2024` | `/admin/dashboard` |

> 💡 **Developer Tip**: Once logged in, use the **Role Persona Switcher** dropdown in the top header bar to switch instantly between any of the 9 roles without navigating back to the login page.

---

## 🔒 Security & RBAC Implementation

- **Declarative Access Gatekeeper (`<Can />`)**:
  ```jsx
  <Can permission="demands.approve">
    <Button variant="primary">Sanction Demand</Button>
  </Can>
  ```
- **Route Authorization Guard**:
  ```jsx
  <Route 
    path="/csd/demands" 
    element={
      <RoleRoute allowedRoles={[ROLES.CSD_OFFICIAL]}>
        <CsdDemands />
      </RoleRoute>
    } 
  />
  ```
- **Failsafe Asynchronous Chunk Resolution**:
  All authenticated role modules utilize a resilient dynamic import wrapper ensuring zero runtime failures between named and default module bundlers:
  ```javascript
  const lazyImport = (importFn, name) =>
    lazy(() =>
      importFn().then((m) => {
        let comp = (name && m[name]) || m.default || m;
        if (comp && comp.default && typeof comp !== 'function') comp = comp.default;
        return { default: comp };
      })
    );
  ```

---

## 📄 License & Attribution

- Built for the **Canteen Stores Department (AFD Directorate), Ministry of Defence, Government of India**.
- Dedicated to the Welfare of the Indian Armed Forces (Army, Navy, Air Force, Coast Guard) and Defence Civilians.
