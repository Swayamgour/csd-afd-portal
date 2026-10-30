// Category specific product fields.
// kind = 'car' | 'bike' | 'appliance'  (same detection the storefront uses)
//
// Field: { key, label, type: 'text' | 'number' | 'select', options?, placeholder?, unit?, top? }
//   top: true  -> stored on the product itself (engineCapacity, fuelType)
//   otherwise  -> stored in product.attributes[key]

export const categoryKind = (cat) => {
  const s = `${cat?.code || ''} ${cat?.name || ''}`.toLowerCase();
  if (s.includes('bike') || s.includes('two') || s.includes('scooter')) return 'bike';
  if (s.includes('white') || s.includes('home') || s.includes('appliance')) return 'appliance';
  return 'car';
};

const sel = (key, label, options, extra = {}) => ({ key, label, type: 'select', options, ...extra });
const num = (key, label, placeholder, extra = {}) => ({ key, label, type: 'number', placeholder, ...extra });
const txt = (key, label, placeholder, extra = {}) => ({ key, label, type: 'text', placeholder, ...extra });

const STAR = ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'];

const CAR = [
  num('engineCapacity', 'Engine Capacity (cc)', 'e.g. 1498', { top: true }),
  sel('fuelType', 'Fuel Type', ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'], { top: true }),
  sel('transmission', 'Transmission', ['Manual', 'Automatic', 'AMT', 'CVT', 'DCT']),
  txt('variant', 'Body Style / Variant', 'e.g. Compact SUV / 7-Seater', { top: true }),
  num('seating', 'Seating Capacity', 'e.g. 5'),
  num('mileage', 'Mileage (kmpl)', 'e.g. 18'),
  txt('power', 'Max Power', 'e.g. 118 bhp'),
  num('boot', 'Boot Space (L)', 'e.g. 400'),
  num('airbags', 'Airbags', 'e.g. 6'),
  txt('brakes', 'Brakes', 'e.g. Disc / ABS + EBD'),
];

const BIKE = [
  num('engineCapacity', 'Engine Capacity (cc)', 'e.g. 150', { top: true }),
  sel('fuelType', 'Fuel Type', ['Petrol', 'Electric'], { top: true }),
  sel('bikeType', 'Bike Type', ['Commuter', 'Sports', 'Cruiser', 'Scooter', 'Adventure', 'Electric Scooter']),
  txt('variant', 'Variant', 'e.g. Standard / Deluxe', { top: true }),
  num('mileage', 'Mileage (kmpl)', 'e.g. 55'),
  txt('power', 'Max Power', 'e.g. 12 bhp'),
  txt('transmission', 'Gearbox', 'e.g. 5 Speed'),
  sel('startType', 'Start Type', ['Kick', 'Self', 'Kick + Self']),
  txt('brakes', 'Brakes', 'e.g. Disc front / Drum rear / ABS'),
  num('fuelTank', 'Fuel Tank (L)', 'e.g. 12'),
  num('weight', 'Kerb Weight (kg)', 'e.g. 140'),
];

const COMMON_APPLIANCE = [
  sel('energyRating', 'Energy Rating', STAR),
  num('warrantyYears', 'Warranty (years)', 'e.g. 2'),
  num('powerConsumption', 'Power Consumption (W)', 'e.g. 500'),
  txt('variant', 'Model / Variant', 'e.g. Inverter 2024', { top: true }),
];

export const APPLIANCE_TYPES = {
  'Washing Machine': [
    num('capacityKg', 'Capacity (kg)', 'e.g. 7'),
    sel('loadType', 'Load Type', ['Front Load', 'Top Load']),
    sel('operation', 'Operation', ['Fully Automatic', 'Semi Automatic']),
    num('spinSpeed', 'Spin Speed (rpm)', 'e.g. 1200'),
  ],
  'Air Conditioner': [
    num('tonnage', 'Capacity (Ton)', 'e.g. 1.5'),
    sel('acType', 'AC Type', ['Split', 'Window', 'Portable']),
    sel('inverter', 'Compressor', ['Inverter', 'Non-Inverter']),
    num('coolingCapacity', 'Cooling Capacity (BTU)', 'e.g. 18000'),
  ],
  Refrigerator: [
    num('capacityL', 'Capacity (L)', 'e.g. 260'),
    sel('doorType', 'Door Type', ['Single Door', 'Double Door', 'Side by Side', 'French Door']),
    sel('inverter', 'Compressor', ['Inverter', 'Non-Inverter']),
  ],
  Television: [
    num('screenSize', 'Screen Size (inch)', 'e.g. 55'),
    sel('resolution', 'Resolution', ['HD', 'Full HD', '4K UHD', '8K']),
    sel('panelType', 'Panel', ['LED', 'OLED', 'QLED']),
    sel('smartTv', 'Smart TV', ['Yes', 'No']),
  ],
  'Microwave Oven': [
    num('capacityL', 'Capacity (L)', 'e.g. 25'),
    sel('microwaveType', 'Type', ['Solo', 'Grill', 'Convection']),
  ],
  'Water Heater': [
    num('capacityL', 'Capacity (L)', 'e.g. 15'),
    sel('heaterType', 'Type', ['Storage', 'Instant']),
  ],
  Other: [txt('capacity', 'Capacity / Size', 'e.g. 10 L')],
};

/** Fields to show for a category kind (+ appliance type). */
export function fieldsFor(kind, applianceType) {
  if (kind === 'bike') return BIKE;
  if (kind === 'appliance') {
    const typeSel = sel('applianceType', 'Appliance Type', Object.keys(APPLIANCE_TYPES));
    return [typeSel, ...(APPLIANCE_TYPES[applianceType] || []), ...COMMON_APPLIANCE];
  }
  return CAR;
}

export const KIND_LABEL = { car: 'Car', bike: 'Bike', appliance: 'Home Appliance' };

export const COMMON_COLORS = [
  ['White', '#ffffff'], ['Black', '#111111'], ['Silver', '#c0c0c0'], ['Grey', '#808080'],
  ['Red', '#d32f2f'], ['Blue', '#1e4fd8'], ['Green', '#2e7d32'], ['Yellow', '#fbc02d'],
];
