export const MOCK_CIRCULARS = [
  {
    id: 'CIR-2024-108',
    title: 'Advisory on Non-Acceptance of Dealer Handling Charges',
    number: 'CSD/AFD/POLICY/CIR/2024/108',
    category: 'Circular',
    status: 'Published',
    publishedDate: '2024-09-28',
    author: 'Joint Director (AFD)',
    fileSize: '1.2 MB',
    summary: 'Strict instructions to all authorized dealerships against demanding documentation, handling, or compulsory accessory charges from Defence beneficiaries.'
  },
  {
    id: 'CIR-2024-102',
    title: 'Revision of Four-Wheeler Car Entitlement Ceilings for JCOs and ORs',
    number: 'MOD/CSD/AFD/REV/2024/02',
    category: 'Office Order',
    status: 'Published',
    publishedDate: '2024-08-15',
    author: 'Quartermaster General Branch (QMG)',
    fileSize: '2.4 MB',
    summary: 'Revision of financial caps for car procurement under Pay Levels 3 through 9 with relaxation on vehicle length limits.'
  },
  {
    id: 'CIR-2024-099',
    title: 'Introduction of Electric Two-Wheelers in CSD AFD Category-II',
    number: 'CSD/AFD/OEM/EV/2024/99',
    category: 'Circular',
    status: 'Review',
    publishedDate: '2024-10-10',
    author: 'Commercial Section',
    fileSize: '890 KB',
    summary: 'Listing of Ather Energy, Ola Electric, and TVS iQube models for direct allocation through Regional Depots.'
  }
];

export const MOCK_BANNERS = [
  { id: 'BAN-01', title: 'Annual Festival Booking Window 2024', status: 'Active', position: 'Home Hero Banner', startDate: '2024-10-01', endDate: '2024-11-15', clicks: 42180 },
  { id: 'BAN-02', title: 'Zero Handling Charges Warning to Dealers', status: 'Active', position: 'Portal Top Ticker', startDate: '2024-09-20', endDate: '2024-12-31', clicks: 18240 },
  { id: 'BAN-03', title: 'New Electric Four-Wheelers Now Available', status: 'Draft', position: 'Product Catalogue Header', startDate: '2024-11-01', endDate: '2024-11-30', clicks: 0 },
];

export const MOCK_DEPOTS = [
  { id: 'DEP-DEL-01', name: 'Delhi Regional CSD Depot', code: 'DOD', location: 'Delhi Cantt', manager: 'Lt. Col. S. N. Rao', phone: '+91 11 2569 1102', activeDemands: 184, ordersDispatched: 912, status: 'Active' },
  { id: 'DEP-PUN-02', name: 'Pune Regional CSD Depot', code: 'POD', location: 'Pune Cantt', manager: 'Lt. Col. V. K. Deshmukh', phone: '+91 20 2636 4410', activeDemands: 142, ordersDispatched: 780, status: 'Active' },
  { id: 'DEP-LKO-03', name: 'Lucknow Central CSD Depot', code: 'LOD', location: 'Lucknow Cantt', manager: 'Col. Rajeshwar Singh', phone: '+91 522 248 1022', activeDemands: 96, ordersDispatched: 540, status: 'Active' },
  { id: 'DEP-KOL-04', name: 'Kolkata Eastern CSD Depot', code: 'KOD', location: 'Fort William Kolkata', manager: 'Lt. Col. S. Banerjee', phone: '+91 33 2222 8901', activeDemands: 88, ordersDispatched: 430, status: 'Active' },
  { id: 'DEP-BLR-05', name: 'Bengaluru Southern CSD Depot', code: 'BOD', location: 'Ulsoor, Bengaluru', manager: 'Col. K. N. Murthy', phone: '+91 80 2555 7712', activeDemands: 110, ordersDispatched: 620, status: 'Active' },
];

export const MOCK_OEMS = [
  { id: 'OEM-01', name: 'Tata Motors Passenger Vehicles Ltd.', category: 'Four-Wheelers & EVs', contactPerson: 'Vikramaditya Singhania', email: 'afd.institutional@tatamotors.com', activeModels: 18, pendingOrders: 42, rating: 4.8, status: 'Approved' },
  { id: 'OEM-02', name: 'Maruti Suzuki India Ltd.', category: 'Four-Wheelers', contactPerson: 'Sunil Aggarwal', email: 'csd.sales@maruti.co.in', activeModels: 24, pendingOrders: 65, rating: 4.9, status: 'Approved' },
  { id: 'OEM-03', name: 'Mahindra & Mahindra Ltd.', category: 'SUVs & Utility', contactPerson: 'Rajan Pillai', email: 'afd.mahindra@mahindra.com', activeModels: 12, pendingOrders: 38, rating: 4.7, status: 'Approved' },
  { id: 'OEM-04', name: 'Royal Enfield (Eicher Motors)', category: 'Two-Wheelers', contactPerson: 'Deepak Chopra', email: 'afd.sales@royalenfield.com', activeModels: 8, pendingOrders: 29, rating: 4.9, status: 'Approved' },
  { id: 'OEM-05', name: 'LG Electronics India Pvt. Ltd.', category: 'White Goods & Appliances', contactPerson: 'K. S. Raman', email: 'csd.appliances@lge.com', activeModels: 34, pendingOrders: 19, rating: 4.6, status: 'Approved' },
];

export const MOCK_DEALERS = [
  { id: 'DLR-ND-082', code: 'DLR-ND-082', name: 'Pratham Motors Pvt. Ltd.', city: 'New Delhi', oem: 'Tata Motors', contact: 'Harpreet Singh Walia', phone: '+91 98100 99887', activeDeliveries: 14, completedDeliveries: 184, status: 'Active', complianceRating: '100% (No Handling Charges)' },
  { id: 'DLR-ND-019', code: 'DLR-ND-019', name: 'South Delhi Motorcycles LLP', city: 'New Delhi', oem: 'Royal Enfield', contact: 'Gaurav Mehra', phone: '+91 98111 44552', activeDeliveries: 6, completedDeliveries: 92, status: 'Active', complianceRating: '98%' },
  { id: 'DLR-MH-044', code: 'DLR-MH-044', name: 'Kothari Hyundai Pune', city: 'Pune', oem: 'Hyundai', contact: 'Sameer Kulkarni', phone: '+91 98220 12345', activeDeliveries: 8, completedDeliveries: 120, status: 'Active', complianceRating: '99%' },
  { id: 'DLR-UP-011', code: 'DLR-UP-011', name: 'Competent Automobiles Ltd.', city: 'Lucknow', oem: 'Maruti Suzuki', contact: 'R. K. Gupta', phone: '+91 94150 11990', activeDeliveries: 11, completedDeliveries: 145, status: 'Under_Notice', complianceRating: '88% (Show-cause notice for fee inquiry)' },
];
