/**
 * CSD AFD Regional Locations, Zones, Depots, URCs & Dealers
 * Extracted and synchronized with official CSD Beneficiary Procurement Manual.
 */

export const MOCK_PRICE_ZONES = [
  { id: 'delhi-ncr', name: 'DELHI NCR (DELHI GREATER NOIDA FARIDABAD GURGAON)', count: 30, taxClass: 'tax-class-8', state: 'Delhi' },
  { id: 'haryana', name: 'HARYANA', count: 24, taxClass: 'tax-class-6', state: 'Haryana' },
  { id: 'punjab', name: 'PUNJAB', count: 18, taxClass: 'tax-class-5', state: 'Punjab' },
  { id: 'uttar-pradesh', name: 'UTTAR PRADESH', count: 32, taxClass: 'tax-class-8', state: 'Uttar Pradesh' },
  { id: 'maharashtra', name: 'MAHARASHTRA', count: 28, taxClass: 'tax-class-7', state: 'Maharashtra' },
  { id: 'rajasthan', name: 'RAJASTHAN', count: 20, taxClass: 'tax-class-6', state: 'Rajasthan' },
  { id: 'karnataka', name: 'KARNATAKA', count: 22, taxClass: 'tax-class-7', state: 'Karnataka' },
  { id: 'jammu-kashmir', name: 'JAMMU & KASHMIR', count: 15, taxClass: 'tax-class-4', state: 'Jammu & Kashmir' }
];

export const MOCK_DEPOTS_LIST = [
  { id: 'AMBALA', name: 'AMBALA', code: 'AMB', location: 'Ambala Cantt', state: 'Haryana' },
  { id: 'DELHI', name: 'DELHI', code: 'DOD', location: 'Delhi Cantt', state: 'Delhi' },
  { id: 'PUNE', name: 'PUNE', code: 'POD', location: 'Pune Cantt', state: 'Maharashtra' },
  { id: 'LUCKNOW', name: 'LUCKNOW', code: 'LOD', location: 'Lucknow Cantt', state: 'Uttar Pradesh' },
  { id: 'JAIPUR', name: 'JAIPUR', code: 'JOD', location: 'Jaipur Cantt', state: 'Rajasthan' },
  { id: 'KOLKATA', name: 'KOLKATA', code: 'KOD', location: 'Fort William Kolkata', state: 'West Bengal' },
  { id: 'BENGALURU', name: 'BENGALURU', code: 'BOD', location: 'Ulsoor, Bengaluru', state: 'Karnataka' },
  { id: 'JALANDHAR', name: 'JALANDHAR', code: 'JLD', location: 'Jalandhar Cantt', state: 'Punjab' },
  { id: 'UDHAMPUR', name: 'UDHAMPUR', code: 'UOD', location: 'Northern Command Udhampur', state: 'Jammu & Kashmir' }
];

export const MOCK_URCS_LIST = [
  {
    id: '7-wing-af',
    code: '685',
    name: '7 WING AF',
    address: 'C/O 56 APO, AIR FORCE STATION AMBALA',
    contactPerson: 'Sgt. M. K. Sharma',
    mobile: '9876543210',
    email: 'urc-685@gmail.com',
    depot: 'AMBALA'
  },
  {
    id: 'af-canteen-race-course',
    code: '712',
    name: 'AF CANTEEN RACE COURSE',
    address: 'AIR FORCE STATION, RACE COURSE, NEW DELHI 110003',
    contactPerson: 'WO R. P. Verma',
    mobile: '9810012345',
    email: 'afcanteen.rc@gmail.com',
    depot: 'DELHI'
  },
  {
    id: 'delhi-cantt-central',
    code: '520',
    name: 'DELHI CANTT CENTRAL URC',
    address: 'SADAR BAZAR, DELHI CANTONMENT, NEW DELHI 110010',
    contactPerson: 'Sub. Major K. S. Pillai',
    mobile: '9811122334',
    email: 'urc.delhicantt@gov.in',
    depot: 'DELHI'
  },
  {
    id: 'hq-western-command',
    code: '410',
    name: 'HQ WESTERN COMMAND URC',
    address: 'CHANDIMANDIR CANTT, PANCHKULA, HARYANA 134107',
    contactPerson: 'Sub. R. S. Rathore',
    mobile: '9417088990',
    email: 'urc.chandimandir@gov.in',
    depot: 'AMBALA'
  },
  {
    id: 'pune-cantt-station-canteen',
    code: '804',
    name: 'SOUTHERN COMMAND STATION URC',
    address: 'MANECKJI MEHTA ROAD, PUNE CANTT 411001',
    contactPerson: 'Sub. Anand Patil',
    mobile: '9822055667',
    email: 'urc.pune@csdindia.gov.in',
    depot: 'PUNE'
  }
];

export const MOCK_DEALERS_LIST = [
  {
    id: 'eakansh-wheels-1802',
    code: '1802',
    name: 'EAKANSH WHEELS (AMBALA)',
    address: 'KM STONE 126, VILL TEPLA, AMBALA JAGADHRI ROAD, AMBALA CANTT 133001, HARYANA',
    contactPerson: 'ASHISH BANSAL, ANUJ BANSAL',
    mobile: '9991100009',
    email: 'marutiarenadealer_1802@gmail.com',
    oem: 'Maruti Suzuki',
    zone: 'HARYANA',
    depot: 'AMBALA'
  },
  {
    id: 'aaa-vehicleades-mundka',
    code: '1540',
    name: 'AAA VEHICLEADES PVT. LTD. MUNDKA (PILLAR)',
    address: 'DELHI ROHTAK ROAD NEAR HIRAN KUDNA MODE METRO PILLAR NO 616 DELHI 110041',
    contactPerson: 'RAJEEV CHOUDHARY',
    mobile: '9810145678',
    email: 'delhi.vehicleades@gmail.com',
    oem: 'Maruti Suzuki',
    zone: 'DELHI NCR (DELHI GREATER NOIDA FARIDABAD GURGAON)',
    depot: 'DELHI'
  },
  {
    id: 'go-auto-pvt-ltd',
    code: '1612',
    name: 'GO AUTO PVT LTD',
    address: 'PLOT 14, INDUSTRIAL AREA PHASE-1, OKHLA, NEW DELHI 110020',
    contactPerson: 'MANISH GOEL',
    mobile: '9818833445',
    email: 'goauto.csd@goauto.in',
    oem: 'Maruti Suzuki',
    zone: 'DELHI NCR (DELHI GREATER NOIDA FARIDABAD GURGAON)',
    depot: 'DELHI'
  },
  {
    id: 'pratham-motors-delhi',
    code: '1320',
    name: 'PRATHAM MOTORS PVT. LTD.',
    address: 'B-1/E-23, MOHAN COOPERATIVE INDUSTRIAL ESTATE, MATHURA ROAD, NEW DELHI 110044',
    contactPerson: 'HARPREET SINGH WALIA',
    mobile: '9810099887',
    email: 'pratham.afd@tatamotorsdealers.com',
    oem: 'Tata Motors',
    zone: 'DELHI NCR (DELHI GREATER NOIDA FARIDABAD GURGAON)',
    depot: 'DELHI'
  },
  {
    id: 'kothari-wheels-pune',
    code: '1425',
    name: 'KOTHARI WHEELS PVT. LTD.',
    address: 'TILAK ROAD, SHUKRAWAR PETH, PUNE 411002, MAHARASHTRA',
    contactPerson: 'SAMEER KULKARNI',
    mobile: '9822012345',
    email: 'csd@kothariwheels.com',
    oem: 'Maruti Suzuki',
    zone: 'MAHARASHTRA',
    depot: 'PUNE'
  }
];

export const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam',
  'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir',
  'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha',
  'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana',
  'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export const PAY_LEVELS = [
  { value: '3A', label: 'Level 3A (Sepoy / Aircraftman / Equivalent)' },
  { value: '4', label: 'Level 4 (Naik / Leading Aircraftman)' },
  { value: '5', label: 'Level 5 (Havildar / Corporal)' },
  { value: '6', label: 'Level 6 (Naib Subedar / Sergeant)' },
  { value: '7', label: 'Level 7 (Subedar / Junior Warrant Officer)' },
  { value: '8', label: 'Level 8 (Subedar Major / Warrant Officer)' },
  { value: '9', label: 'Level 9 (Honorary Lieutenant / Master Warrant Officer)' },
  { value: '10', label: 'Level 10 (Lieutenant / Flying Officer / Sub Lieutenant)' },
  { value: '10B', label: 'Level 10B (Captain / Flight Lieutenant / Lieutenant)' },
  { value: '11', label: 'Level 11 (Major / Squadron Leader / Lt Commander)' },
  { value: '12', label: 'Level 12 (Lt Colonel / Wing Commander / Commander)' },
  { value: '13', label: 'Level 13 (Colonel / Group Captain / Captain)' },
  { value: '13A', label: 'Level 13A (Brigadier / Air Commodore / Commodore)' },
  { value: '14', label: 'Level 14 (Major General / Air Vice Marshal / Rear Admiral)' },
  { value: '15', label: 'Level 15 (Lt General / Air Marshal / Vice Admiral)' },
  { value: '16', label: 'Level 16 (Army Commander / Air Commander)' },
  { value: '17', label: 'Level 17 (Chief of Army / Air / Naval Staff)' },
  { value: '18', label: 'Level 18 (CDS / Field Marshal)' }
];
