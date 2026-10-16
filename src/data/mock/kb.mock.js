export const MOCK_KB_ARTICLES = [
  {
    id: 'KB-AFD-001',
    title: 'Revised Entitlement Rules for Purchase of Four-Wheelers (Car) through CSD AFD',
    category: 'Eligibility & Entitlements',
    tags: ['car', 'eligibility', 'rank', 'quota', 'pay-level'],
    summary: 'Comprehensive guidelines outlining the financial caps, engine CC capacity, and periodicity intervals across Officers, JCOs, and ORs.',
    updatedAt: '2024-09-15',
    views: 18420,
    author: 'Policy Cell, CSD HO Mumbai',
    content: `
### 1. Entitlement Hierarchy
- **Officers (Pay Level 10 to 18)**: Cap up to Rs 20.0 Lakhs (excluding GST/cess), eligible once every 8 years.
- **JCOs / Honorary Officers (Pay Level 7 to 9)**: Cap up to Rs 10.0 Lakhs (excluding GST/cess), eligible once every 8 years. First car after 5 years of service.
- **Other Ranks / ORs (Pay Level 3 to 6)**: Cap up to Rs 8.0 Lakhs (excluding GST/cess), eligible once during service and once after retirement (total 2 in lifetime).

### 2. Mandatory Verification Documents
1. Availment Certificate duly countersigned by Commanding Officer / OC Station.
2. Form-16 or latest Salary Statement showing Basic Pay & Pay Level.
3. Dealer Quota Allotment / Availability Letter.
4. Driving License and PAN Card copies.
    `
  },
  {
    id: 'KB-AFD-002',
    title: 'Step-by-Step Payment Process via Bharatkosh and SBI Cyber Treasury',
    category: 'Payments',
    tags: ['payment', 'sbi', 'bharatkosh', 'challan', 'cyber-treasury', 'gateway'],
    summary: 'How to pay the exact sanctioned AFD demand amount, download e-receipt, and prevent challan rejection.',
    updatedAt: '2024-10-01',
    views: 14210,
    author: 'Accounts Directorate',
    content: `
### Payment Instructions
- Always generate the Payment Challan from your portal dashboard **after** Depot Sanction is received.
- Ensure the Demand ID is explicitly mentioned in the payment remarks/narration.
- Do not pay via UPI if the amount exceeds daily bank limits (Rs 1 Lakh or Rs 5 Lakh depending on bank). Net Banking or SBI Branch e-Challan is advised.
- Payment realization typically takes 24 to 48 working hours to reconcile with CSD treasury servers.
    `
  },
  {
    id: 'KB-AFD-003',
    title: 'Resolution of Dealer Overcharging & Unauthorized Logistics/Handling Fees',
    category: 'Dealer & Delivery',
    tags: ['dealer', 'overcharging', 'handling-charges', 'pricing', 'complaint'],
    summary: 'Instructions on handling unauthorized dealer charges. Dealerships are forbidden by Ministry of Defence from levying handling/logistics charges.',
    updatedAt: '2024-08-20',
    views: 9840,
    author: 'Vigilance & Operations Cell',
    content: `
### Strict Prohibition of Handling Charges
As per CSD General Conditions of Contract (GCC), no dealer is permitted to levy:
1. Handling or documentation charges
2. Mandatory dealership accessory bundles
3. Compulsory dealer-tied vehicle insurance (beneficiary is free to choose any IRDAI-registered insurer)

If a dealer insists on such payments, register a ticket immediately under the 'Dealer Overcharging' category and attach the dealer proforma.
    `
  },
  {
    id: 'KB-AFD-004',
    title: 'Procedure for Supply Order Cancellation and Full Refund',
    category: 'Supply Order',
    tags: ['cancellation', 'refund', 'change-of-model', 'supply-order'],
    summary: 'Rules governing cancellation before dealer delivery and timeline for refund credit to original bank account.',
    updatedAt: '2024-07-10',
    views: 6510,
    author: 'Finance & Audit Wing',
    content: `
### Refund Procedure
- A demand can be cancelled unilaterally before payment realization with zero penalty.
- If Supply Order has already been issued, cancellation requires a Non-Delivery Certificate from the authorized dealer.
- Refunds are credited to the beneficiary source account within 7 to 10 working days after depot clearance.
    `
  }
];

export const MOCK_FAQS = [
  { q: 'Can I purchase an electric vehicle (EV) through CSD AFD?', a: 'Yes, electric cars and two-wheelers listed by empaneled OEMs (such as Tata Nexon EV, MG, Ather, Ola Electric) are eligible under standard AFD-I guidelines.' },
  { q: 'How do I track my vehicle dispatch from the factory?', a: 'Once the Depot issues your Supply Order, your dealer receives the allocation. You can view the Live Status in the Orders tab of your Beneficiary Dashboard.' },
  { q: 'What is the validity period of an issued Supply Order?', a: 'A CSD AFD Supply Order is valid for 90 days from the date of issue. In exceptional cases, an extension of 30 days may be sanctioned by the Regional Depot Manager.' },
  { q: 'Can retired defence personnel apply for two-wheelers and white goods?', a: 'Yes, ESM (Ex-Servicemen) and Defence Widows holding valid CSD Smart Cards are fully eligible for two-wheelers (every 3 years) and white goods/appliances without quota limitations.' }
];

export const getSuggestedArticles = (categoryOrKeyword = '') => {
  const kw = categoryOrKeyword.toLowerCase();
  return MOCK_KB_ARTICLES.filter(a =>
    a.title.toLowerCase().includes(kw) ||
    a.category.toLowerCase().includes(kw) ||
    a.tags.some(t => t.includes(kw))
  );
};
