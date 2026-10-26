// Prices/specs below are taken from the reference screenshots. MOCK DATA - replace via src/data/api.js.
const fm = v => (Number.isInteger(v) ? String(v) : v.toFixed(2))

const CAR_METAS = {
  c1: { sku: '68010', indexNo: '68010', mfrCode: 'MAR-BAL-01' },
  c2: { sku: '68512', indexNo: '68512', mfrCode: 'MAR-FRX-01' },
  c3: { sku: '69201', indexNo: '69201', mfrCode: 'TOY-TSR-01' },
  c4: { sku: '66310', indexNo: '66310', mfrCode: 'TAT-PNC-01' },
  c5: { sku: '67356', indexNo: '67356', mfrCode: 'MAH-THAR-01' },
  c6: { sku: '64224', indexNo: '64224', mfrCode: 'REN-KWID-01' },
  c7: { sku: '66205', indexNo: '66205', mfrCode: 'TAT-NEX-01' },
  c8: { sku: '67681', indexNo: '67681', mfrCode: 'MAH-SCP-01' },
  c9: { sku: '65112', indexNo: '65112', mfrCode: 'TAT-CURV-01' },
  c10: { sku: '68450', indexNo: '68450', mfrCode: 'MAR-SWF-01' },
  c11: { sku: '67110', indexNo: '67110', mfrCode: 'MAH-3XO-01' },
  c12: { sku: '68720', indexNo: '68720', mfrCode: 'MAR-DZR-01' },
  c13: { sku: '69350', indexNo: '69350', mfrCode: 'HYU-VRN-01' },
  c14: { sku: '69410', indexNo: '69410', mfrCode: 'HON-CTY-01' },
  c15: { sku: '69520', indexNo: '69520', mfrCode: 'HYU-AUR-01' },
  c16: { sku: '66430', indexNo: '66430', mfrCode: 'TAT-TGR-01' },
  c17: { sku: '69480', indexNo: '69480', mfrCode: 'HON-AMZ-01' },
  c18: { sku: '69610', indexNo: '69610', mfrCode: 'SKO-SLV-01' },
  c19: { sku: '69710', indexNo: '69710', mfrCode: 'VW-VRT-01' },
}

const BIKE_METAS = {
  b1: { sku: '70110', indexNo: '70110', mfrCode: 'RE-CLS-350' },
  b2: { sku: '70120', indexNo: '70120', mfrCode: 'RE-HNT-350' },
  b3: { sku: '70210', indexNo: '70210', mfrCode: 'YAM-MT15-01' },
  b4: { sku: '70220', indexNo: '70220', mfrCode: 'YAM-R15-01' },
  b5: { sku: '70310', indexNo: '70310', mfrCode: 'TVS-RTR-160' },
  b6: { sku: '70410', indexNo: '70410', mfrCode: 'BAJ-NS-200' },
  b7: { sku: '71220', indexNo: '71220', mfrCode: 'HERO-SPL-01' },
  b8: { sku: '70510', indexNo: '70510', mfrCode: 'HON-ACT-6G' },
  b9: { sku: '70610', indexNo: '70610', mfrCode: 'SUZ-ACC-125' },
  b10: { sku: '70320', indexNo: '70320', mfrCode: 'TVS-JUP-125' },
  b11: { sku: '70520', indexNo: '70520', mfrCode: 'HON-CB-350' },
  b12: { sku: '71230', indexNo: '71230', mfrCode: 'HERO-XPL-200' },
  b13: { sku: '70420', indexNo: '70420', mfrCode: 'BAJ-CHT-EV' },
  b14: { sku: '70710', indexNo: '70710', mfrCode: 'KTM-DUK-200' },
  b15: { sku: '70620', indexNo: '70620', mfrCode: 'SUZ-GIX-250' },
  b16: { sku: '70130', indexNo: '70130', mfrCode: 'RE-BLT-350' },
}

const APPL_METAS = {
  w1: { sku: '80110', indexNo: '80110', mfrCode: 'LG-REF-242' },
  w2: { sku: '80210', indexNo: '80210', mfrCode: 'HAI-WM-6KG' },
  w3: { sku: '80410', indexNo: '80410', mfrCode: 'PAN-MCW-25L' },
  w4: { sku: '80510', indexNo: '80510', mfrCode: 'SAM-TV-32' },
  w5: { sku: '80310', indexNo: '80310', mfrCode: 'WPL-REF-200' },
  w6: { sku: '80120', indexNo: '80120', mfrCode: 'LG-WM-FL' },
  w7: { sku: '80130', indexNo: '80130', mfrCode: 'LG-MCW-BLK' },
  w8: { sku: '80520', indexNo: '80520', mfrCode: 'SAM-REF-FR' },
}

const car = (id, name, brand, type, lo, hi, rating, trans, engine, fuel, power, mileage, boot, airbags, colors, image) => {
  const meta = CAR_METAS[id] || { sku: `68${id.replace(/\D/g, '').padStart(3, '0')}`, indexNo: `68${id.replace(/\D/g, '').padStart(3, '0')}`, mfrCode: `${brand.slice(0, 3).toUpperCase()}-${id.toUpperCase()}` }
  return {
    id, img: `/img/${id}.jpg`, image, images: [
      image,
      `/img/${id}/front.jpg`,
      `/img/${id}/rear.jpg`,
      `/img/${id}/left.jpg`,
      `/img/${id}/right.jpg`,
      `/img/${id}/side.jpg`,
    ], category: 'car', name, brand, type, lo, hi,
    sku: meta.sku,
    indexNo: meta.indexNo,
    mfrCode: meta.mfrCode,
    priceToCustomer: lo < 1000 ? Math.round(lo * 100000) : lo,
    price: lo < 1000 ? Math.round(lo * 100000) : lo,
    mrp: hi < 1000 ? Math.round(hi * 100000) : hi,
    priceRange: `₹${fm(lo)} - ${fm(hi)} Lakh`, rating, reviews: 984, trans, engine, fuel, power, mileage, boot, airbags, colors
  }
}

const bike = (
  id,
  name,
  brand,
  type,
  lo,
  hi,
  rating,
  engine,
  fuel,
  power,
  mileage,
  brakes,
  colors,
  image
) => {
  const meta = BIKE_METAS[id] || { sku: `70${id.replace(/\D/g, '').padStart(3, '0')}`, indexNo: `70${id.replace(/\D/g, '').padStart(3, '0')}`, mfrCode: `${brand.slice(0, 3).toUpperCase()}-${id.toUpperCase()}` }
  return {
    id,
    img: `/img/${id}.jpg`,
    image,
    images: [
      image,
      `/img/${id}/front.jpg`,
      `/img/${id}/rear.jpg`,
      `/img/${id}/left.jpg`,
      `/img/${id}/right.jpg`,
      `/img/${id}/side.jpg`,
    ],
    category: "bike",
    name,
    brand,
    type,
    lo,
    hi,
    sku: meta.sku,
    indexNo: meta.indexNo,
    mfrCode: meta.mfrCode,
    priceToCustomer: lo < 1000 ? Math.round(lo * 100000) : lo,
    price: lo < 1000 ? Math.round(lo * 100000) : lo,
    mrp: hi < 1000 ? Math.round(hi * 100000) : hi,
    priceRange: `₹${fm(lo)} - ${fm(hi)} Lakh`,
    rating,
    reviews: 984,
    engine,
    fuel,
    power,
    mileage,
    brakes,
    colors,
  }
}

const appl = (id, name, brand, type, price, mrp, rating, reviews, image) => {
  const meta = APPL_METAS[id] || { sku: `80${id.replace(/\D/g, '').padStart(3, '0')}`, indexNo: `80${id.replace(/\D/g, '').padStart(3, '0')}`, mfrCode: `${brand.slice(0, 3).toUpperCase()}-${id.toUpperCase()}` }
  return {
    id,
    img: `/img/${id}.jpg`,
    image,
    category: 'white-goods',
    name,
    brand,
    type,
    sku: meta.sku,
    indexNo: meta.indexNo,
    mfrCode: meta.mfrCode,
    price: `₹${price.toLocaleString('en-IN')}`,
    lo: price,
    hi: price,
    mrp,
    discount: Math.round((1 - price / mrp) * 100),
    rating,
    reviews
  }
}

const C = ['Blue', 'Red', 'Black', 'Silver']
export const products = [
  car('c6', 'Renault KWID', 'Renault', 'Hatchback', 4.7, 6.45, 4.1, 'Manual / Automatic', '999 cc', ['Petrol'], '67 bhp', '21.46 - 22.3 kmpl', '279 Liters', '2-4', C, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-v842sdZj_CTv0tKS_JiBGSJGYWC1BFbQp8lvihtN63X3lBC8X7mZg_o&s=10"),
  car('c9', 'Tata Curvv', 'Tata', 'SUV', 10, 19, 4.4, 'Manual / Automatic', '-', ['Petrol', 'Diesel'], '-', '-', '-', '-', C, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7A6iRQZ-KNGjHeQIVlg8JTKb_UvlR4LD_Fw5PhKoU9Q&s=10"),
  car('c7', 'Tata Nexon', 'Tata', 'SUV', 8, 15.8, 4.4, 'Manual / Automatic', '1199 cc - 1497 cc', ['Petrol', 'Diesel', 'CNG'], '99 - 118 bhp', '17 - 24 kmpl', '382 Liters', '6', C, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdZQpuzJTWti0_VxhNbm9IoeIvOiTq_KooSFUy1GWJlw&s=10"),
  car('c11', 'Mahindra XUV 3XO', 'Mahindra', 'SUV', 7.49, 15.49, 4.4, 'Manual / Automatic', '-', ['Petrol', 'Diesel'], '-', '-', '-', '-', C, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQwRicNJxtukdhz-fogmwl3jDHMeEsxUKWd-D3JL3sQSw&s=10"),
  car('c1', 'Maruti Baleno', 'Maruti', 'Hatchback', 6.66, 9.83, 4.4, 'Manual / Automatic', '1197 cc', ['Petrol', 'CNG'], '76.43 - 88.5 bhp', '22.35 - 22.94 kmpl', '318 Liters', '2-6', C, "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTcj0XBX8QgG4bAL2SIsWQ9n8DLdTqutGfsS6e-bJDy2Q&s=10"),
  car('c10', 'Maruti Swift', 'Maruti', 'Hatchback', 6.49, 9.59, 4.4, 'Manual / Automatic', '-', ['Petrol', 'CNG'], '-', '-', '-', '-', C, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQ8pqmiGzJJjn2lzIwRV8ipG0G0XZWS8SdKEQV7uA5tA&s=10'),
  car('c2', 'Maruti FRONX', 'Maruti', 'SUV', 7.51, 13.04, 4.5, 'Manual / Automatic', '998 cc - 1197 cc', ['Petrol', 'CNG'], '76.43 - 98.69 bhp', '20.01 - 22.89 kmpl', '308 Liters', '2-6', C, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgDkgTyMRJsH4c2ll780TiCV0YqKbHywuknB46wGbVHQ&s=10'),
  car('c8', 'Mahindra Scorpio', 'Mahindra', 'SUV', 13.62, 17.42, 4.4, 'Manual', '-', ['Diesel'], '-', '-', '-', '-', C, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTI-H7BgrOCePjC3bWSxscS3iBiiGx8Z-6lRUzLU3DHiA&s=10'),
  car('c3', 'Toyota Taisor', 'Toyota', 'SUV', 7.74, 13.04, 4.2, 'Manual / Automatic', '998 cc - 1197 cc', ['Petrol', 'CNG'], '76.43 - 98.69 bhp', '20 - 22.8 kmpl', '308 Liters', '2-6', C, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8kHyxzfHZWlU0M9ge133C5MQ2Dsat8AgwIAb2pbp2Tg&s=10'),
  car('c4', 'Tata Punch', 'Tata', 'SUV', 6, 10.2, 4.5, 'Manual / Automatic', '1199 cc', ['Petrol', 'CNG'], '72.41 - 86.63 bhp', '18.8 - 20.09 kmpl', '-', '2', C, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3mLyx99SNFWOIg-lpoXJlD0exdNNsylg6_97usCfGoA&s=10'),
  car('c5', 'Mahindra Thar ROXX', 'Mahindra', 'SUV', 12.99, 20.49, 4.7, 'Manual / Automatic', '1997 cc - 2184 cc', ['Petrol', 'Diesel'], '150 - 174 bhp', '12.4 - 15.2 kmpl', '-', '6', ['Red', 'Black', 'Silver'], 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHHSgJprD1K8TbYLGcNjstXR-3rM7g0Tl73OFsDUL69Q&s=10'),
  car('c12', 'Maruti Suzuki Dzire ZXI Plus', 'Maruti', 'Sedan', 6.79, 9.39, 4.5, 'Manual / Automatic', '1197 cc', ['Petrol', 'CNG'], '80 bhp', '24.79 - 33.73 kmpl', '382 Liters', '6', C, 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600'),
  car('c13', 'Hyundai Verna 1.5 Turbo SX(O)', 'Hyundai', 'Sedan', 11.00, 17.42, 4.6, 'Manual / Automatic', '1498 cc', ['Petrol'], '158 bhp', '18.6 - 20.6 kmpl', '528 Liters', '6', C, 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=600'),
  car('c14', 'Honda City 1.5 V Elegance', 'Honda', 'Sedan', 12.08, 16.35, 4.5, 'Manual / Automatic', '1498 cc', ['Petrol'], '119 bhp', '17.8 - 18.4 kmpl', '506 Liters', '6', C, 'https://images.unsplash.com/photo-1590362891988-f778047831d0?w=600'),
  car('c15', 'Hyundai Aura SX 1.2 Kappa', 'Hyundai', 'Sedan', 6.53, 9.10, 4.3, 'Manual / Automatic', '1197 cc', ['Petrol', 'CNG'], '82 bhp', '20.5 - 28.4 kmpl', '402 Liters', '4', C, 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600'),
  car('c16', 'Tata Tigor XZ Plus Leatherette', 'Tata', 'Sedan', 6.30, 8.95, 4.4, 'Manual / Automatic', '1199 cc', ['Petrol', 'CNG'], '85 bhp', '19.6 - 26.4 kmpl', '419 Liters', '2', C, 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600'),
  car('c17', 'Honda Amaze 1.2 VX Elite', 'Honda', 'Sedan', 7.20, 9.96, 4.4, 'Manual / Automatic', '1199 cc', ['Petrol'], '89 bhp', '18.6 kmpl', '420 Liters', '2', C, 'https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600'),
  car('c18', 'Skoda Slavia 1.0 TSI Style', 'Skoda', 'Sedan', 11.63, 18.34, 4.5, 'Manual / Automatic', '999 cc', ['Petrol'], '114 bhp', '19.4 kmpl', '521 Liters', '6', C, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600'),
  car('c19', 'Volkswagen Virtus Topline 1.0 TSI', 'Volkswagen', 'Sedan', 11.56, 19.41, 4.6, 'Manual / Automatic', '999 cc', ['Petrol'], '114 bhp', '19.4 kmpl', '521 Liters', '6', C, 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600'),


  // =========================
  // BIKES
  // =========================

  bike(
    "b1",
    "Royal Enfield Classic 350",
    "Royal Enfield",
    "Cruiser",
    1.93,
    2.30,
    4.5,
    "349 cc",
    ["Petrol"],
    "20.2 bhp",
    "41.55 kmpl",
    "Disc / Disc",
    ["Black", "Red", "Blue", "Silver"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQT5_nm6MsZz2lYQDtkx6hEcdtt1glcxMoPvnqfobTaTA&s=10"
  ),

  bike(
    "b2",
    "Royal Enfield Hunter 350",
    "Royal Enfield",
    "Roadster",
    1.50,
    1.77,
    4.4,
    "349 cc",
    ["Petrol"],
    "20.2 bhp",
    "36.2 kmpl",
    "Disc / Disc",
    ["Black", "Red", "Blue"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkqjftTSPwnU-8nWUCpOds89WZr_8FIQWvIcuAXBuCrA&s=10"
  ),

  bike(
    "b3",
    "Yamaha MT 15 V2",
    "Yamaha",
    "Sports",
    1.70,
    1.75,
    4.5,
    "155 cc",
    ["Petrol"],
    "18.4 bhp",
    "56.87 kmpl",
    "Disc / Disc",
    ["Black", "Blue", "Red"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxFacR_gWWtfrr0jQeGCI_X4ESu3DfUpaSdWZu0OX_uw&s=10"
  ),

  bike(
    "b4",
    "Yamaha R15 V4",
    "Yamaha",
    "Sports",
    1.83,
    2.12,
    4.6,
    "155 cc",
    ["Petrol"],
    "18.4 bhp",
    "51.4 kmpl",
    "Disc / Disc",
    ["Blue", "Black", "Red"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5Pn2LiRmvQ1aZO8o7vAduLPtzDfNfcSxh_JEFWSvsFg&s=10"
  ),

  bike(
    "b5",
    "TVS Apache RTR 160",
    "TVS",
    "Sports",
    1.20,
    1.30,
    4.3,
    "159.7 cc",
    ["Petrol"],
    "16.04 bhp",
    "47 kmpl",
    "Disc / Disc",
    ["Black", "Red", "Blue"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRfnZLDLJ1fQXughlke6ZkwkwFI1QPKQswc2JYsUbhSrw&s=10"
  ),

  bike(
    "b6",
    "Bajaj Pulsar NS200",
    "Bajaj",
    "Sports",
    1.59,
    1.59,
    4.4,
    "199.5 cc",
    ["Petrol"],
    "24.5 bhp",
    "40.36 kmpl",
    "Disc / Disc",
    ["Black", "Red", "White"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTW4ydB4ODI0CWC32mL6L5hFfDfNt5oyRjtn1H8-JAC7Q&s=10"
  ),

  bike(
    "b7",
    "Hero Splendor Plus",
    "Hero",
    "Commuter",
    0.77,
    0.81,
    4.2,
    "97.2 cc",
    ["Petrol"],
    "8.02 bhp",
    "73 kmpl",
    "Drum / Drum",
    ["Black", "Red", "Blue"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNJfN_p-WC562ZDY6HXWq2ZV4v_uUyKHjB3nLc33bKuw&s=10"
  ),

  bike(
    "b8",
    "Honda Activa 6G",
    "Honda",
    "Scooter",
    0.79,
    0.85,
    4.3,
    "109.51 cc",
    ["Petrol"],
    "7.73 bhp",
    "50 kmpl",
    "Drum / Drum",
    ["Black", "White", "Red", "Blue"],
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzuI4azOOzgM165eFQcdXq4Yr3L4sch4cCucUtLA6qSw&s=10"
  ),
  bike(
    "b9",
    "Suzuki Access 125 Special Edition",
    "Suzuki",
    "Scooter",
    0.82,
    0.93,
    4.4,
    "124 cc",
    ["Petrol"],
    "8.6 bhp",
    "45 kmpl",
    "Disc / Drum",
    ["Black", "Blue", "White"],
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600"
  ),
  bike(
    "b10",
    "TVS Jupiter 125 SmartXonnect",
    "TVS",
    "Scooter",
    0.86,
    0.98,
    4.3,
    "124.8 cc",
    ["Petrol"],
    "8.04 bhp",
    "50 kmpl",
    "Disc / Drum",
    ["Blue", "Grey", "White"],
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600"
  ),
  bike(
    "b11",
    "Honda CB350 H'ness DLX Pro",
    "Honda",
    "Cruiser",
    2.10,
    2.18,
    4.6,
    "348.36 cc",
    ["Petrol"],
    "20.78 bhp",
    "35 kmpl",
    "Disc / Disc",
    ["Black", "Green", "Red"],
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600"
  ),
  bike(
    "b12",
    "Hero Xpulse 200 4V Pro",
    "Hero",
    "Sports",
    1.47,
    1.54,
    4.5,
    "199.6 cc",
    ["Petrol"],
    "18.9 bhp",
    "40 kmpl",
    "Disc / Disc",
    ["Blue", "Red", "Black"],
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600"
  ),
  bike(
    "b13",
    "Bajaj Chetak Premium EV",
    "Bajaj",
    "Scooter",
    1.15,
    1.45,
    4.3,
    "Electric Motor",
    ["Electric"],
    "5.5 bhp",
    "126 km/charge",
    "Disc / Drum",
    ["White", "Blue", "Black"],
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600"
  ),
  bike(
    "b14",
    "KTM 200 Duke ABS",
    "KTM",
    "Sports",
    1.98,
    2.05,
    4.6,
    "199.5 cc",
    ["Petrol"],
    "24.67 bhp",
    "35 kmpl",
    "Disc / Disc",
    ["Orange", "White", "Black"],
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600"
  ),
  bike(
    "b15",
    "Suzuki Gixxer SF 250",
    "Suzuki",
    "Sports",
    1.92,
    2.05,
    4.5,
    "249 cc",
    ["Petrol"],
    "26.13 bhp",
    "38 kmpl",
    "Disc / Disc",
    ["Blue", "Black"],
    "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600"
  ),
  bike(
    "b16",
    "Royal Enfield Bullet 350 Standard",
    "Royal Enfield",
    "Cruiser",
    1.74,
    2.16,
    4.6,
    "349 cc",
    ["Petrol"],
    "20.2 bhp",
    "37 kmpl",
    "Disc / Drum",
    ["Black", "Maroon"],
    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600"
  ),
  appl('w1', 'LG 242 L 3 Star Smart Inverter Double Door Fridge', 'LG', 'Fridge', 25990, 37000, 4.4, 984, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyfa_4TUsJB7NxbUJFDsYfv871Dlf9aghaLy20Zn3Eqg&s'),
  appl('w2', 'Haier 6kg 5 star Washing Machine', 'Haier', 'Washing Machine', 4999, 6000, 4.2, 121, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTaT0PzQUPA6EO6B7End3szRh_Y4fydOTLT9X_2iQHstw&s=10'),
  appl('w5', 'Whirlpool 200 L 3 Star Direct-Cool Double Door Refrigerator', 'Whirlpool', 'Fridge', 21990, 38200, 4.2, 121, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBTtroyyoAm-XK25gl_MAY6aque66n846RVkzZhCXYaA&s=10'),
  appl('w3', 'Panasonic 25L Microwave Oven', 'Panasonic', 'Microwave', 11490, 16000, 4.3, 518, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyfa_4TUsJB7NxbUJFDsYfv871Dlf9aghaLy20Zn3Eqg&s'),
  appl('w6', 'LG Fully Automatic Front Loading Washing Machine', 'LG', 'Washing Machine', 25490, 37900, 4.4, 121, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyfa_4TUsJB7NxbUJFDsYfv871Dlf9aghaLy20Zn3Eqg&s'),
  appl('w7', 'LG Microwave Oven (Black, With Health Plus Menu & Steam Clean)', 'LG', 'Microwave', 7190, 8190, 4.4, 984, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyfa_4TUsJB7NxbUJFDsYfv871Dlf9aghaLy20Zn3Eqg&s'),
  appl('w4', 'Samsung 80 cm (32 inches) HD Ready Smart LED TV', 'Samsung', 'Television', 15240, 16900, 4.4, 954, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyfa_4TUsJB7NxbUJFDsYfv871Dlf9aghaLy20Zn3Eqg&s'),
  appl('w8', 'Samsung, Convertible, Inverter, Frost Free French Refrigerator', 'Samsung', 'Fridge', 69990, 87990, 4.4, 954, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0LQJJ_2bxMVqNGHoEiM4hhaFQwsy4hJrn-6ItlTJbYg&s=10'),
]


export const topDiscount = [
  {
    id: 1,
    name: "LG 242 L 3 Star Smart Inverter Double Door Fridge",
    category: "Refrigerator",
    price: 4999,
    mrp: 4999,
    discount: "10%",
    category: "car",
    originalPrice: 37000,
    discount: 30,
    rating: 5,
    reviews: 984,

    image:
      "https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcQogZt-lorLdWgNmh-1GnHpKnYdFdFIMeZSH_rHkK3mULVkWd7W6tYWGcTRNf7j8LGAvBwCisG2Sr3F9HpuYomSTIQdAv3kDh-e2EXLADh5GV-ERAhwaGKPg2w",

    link: "/products/lg-242l-fridge"
  },

  {
    id: 2,
    name: "Maruti Baleno",
    category: "Car",
    price: 4999,
    mrp: 499,
    discount: "10%",
    category: "car",
    originalPrice: null,
    discount: null,
    rating: 5,
    reviews: 984,

    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuAL5d5rrkclpBfx7m1CmfRRPlk_mced21jnOGE5wduQ&s=10",

    link: "/products/maruti-baleno"
  },

  {
    id: 3,
    name: "Panasonic 25L Microwave Oven",
    category: "Microwave",
    price: 4999,
    mrp: 4999,
    discount: "10%",
    category: "car",
    originalPrice: 16000,
    discount: 28,
    rating: 5,
    reviews: 518,

    image:
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcTT_lbJVdfNaQuNuneatwiUGkRRlH-XzNtqDA5j54lvkY02E8hEYZa1bsOrFHkr5bWBeY3vfi5QHCpwYcSafggEqHW7gKkcVB-4XNgTTxLaVtnPgkQlWGMm50DZVVwzCOEIBBqdvw&usqp=CAc",

    link: "/products/panasonic-25l-microwave"
  },

  {
    id: 4,
    name: "Haier 6kg 5 Star Washing Machine",
    category: "Washing Machine",
    price: 4999,
    mrp: 4999,
    discount: "10%",
    category: "car",
    originalPrice: 6000,
    discount: 17,
    rating: 5,
    reviews: 984,

    image:
      "https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSQk_HUdoj7qm3lfBeTW9Yt6_Vaypbo-x_wvyrOejQfMarNouxkRkYp-AflSJpBJRKINZzDXlL0vtrctDOJwSbql8gPeJstFH_BbYZZ1d6mUpYGxNjRsGMKqBClKIv0wQgoTQlXew&usqp=CAc",

    link: "/products/haier-6kg-washing-machine"
  },

  {
    id: 5,
    name: "LG Fully Automatic Front Loading Washing Machine",
    category: "Washing Machine",
    price: 4999,
    mrp: 4999,
    discount: "10%",
    category: "car",
    originalPrice: 37900,
    discount: 33,
    rating: 5,
    reviews: 984,

    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBW44os0tEJgPUFjB-AXPww1bSrhHaluaFN7G90nXV3Q&s=10",

    link: "/products/lg-front-load-washing-machine"
  }
];



export const cars = [
  {
    id: "c6",
    name: "Renault KWID",
    brand: "Renault",
    type: "Hatchback",
    priceMin: 4.7,
    priceMax: 6.45,
    rating: 4.1,
    transmission: "Manual / Automatic",
    engine: "999 cc",
    fuel: ["Petrol"],
    power: "67 bhp",
    mileage: "21.46 - 22.3 kmpl",
    bootSpace: "279 Liters",
    seating: "2-4",
    colors: []
  },

  {
    id: "c9",
    name: "Tata Curvv",
    brand: "Tata",
    type: "SUV",
    priceMin: 10,
    priceMax: 19,
    rating: 4.4,
    transmission: "Manual / Automatic",
    engine: "-",
    fuel: ["Petrol", "Diesel"],
    power: "-",
    mileage: "-",
    bootSpace: "-",
    seating: "-",
    colors: []
  },

  {
    id: "c7",
    name: "Tata Nexon",
    brand: "Tata",
    type: "SUV",
    priceMin: 8,
    priceMax: 15.8,
    rating: 4.4,
    transmission: "Manual / Automatic",
    engine: "1199 cc - 1497 cc",
    fuel: ["Petrol", "Diesel", "CNG"],
    power: "99 - 118 bhp",
    mileage: "17 - 24 kmpl",
    bootSpace: "382 Liters",
    seating: "6",
    colors: []
  },

  {
    id: "c11",
    name: "Mahindra XUV 3XO",
    brand: "Mahindra",
    type: "SUV",
    priceMin: 7.49,
    priceMax: 15.49,
    rating: 4.4,
    transmission: "Manual / Automatic",
    engine: "-",
    fuel: ["Petrol", "Diesel"],
    power: "-",
    mileage: "-",
    bootSpace: "-",
    seating: "-",
    colors: []
  },

  {
    id: "c1",
    name: "Maruti Baleno",
    brand: "Maruti",
    type: "Hatchback",
    priceMin: 6.66,
    priceMax: 9.83,
    rating: 4.4,
    transmission: "Manual / Automatic",
    engine: "1197 cc",
    fuel: ["Petrol", "CNG"],
    power: "76.43 - 88.5 bhp",
    mileage: "22.35 - 22.94 kmpl",
    bootSpace: "318 Liters",
    seating: "2-6",
    colors: []
  },

  {
    id: "c10",
    name: "Maruti Swift",
    brand: "Maruti",
    type: "Hatchback",
    priceMin: 6.49,
    priceMax: 9.59,
    rating: 4.4,
    transmission: "Manual / Automatic",
    engine: "-",
    fuel: ["Petrol", "CNG"],
    power: "-",
    mileage: "-",
    bootSpace: "-",
    seating: "-",
    colors: []
  },

  {
    id: "c2",
    name: "Maruti FRONX",
    brand: "Maruti",
    type: "SUV",
    priceMin: 7.51,
    priceMax: 13.04,
    rating: 4.5,
    transmission: "Manual / Automatic",
    engine: "998 cc - 1197 cc",
    fuel: ["Petrol", "CNG"],
    power: "76.43 - 98.69 bhp",
    mileage: "20.01 - 22.89 kmpl",
    bootSpace: "308 Liters",
    seating: "2-6",
    colors: []
  },

  {
    id: "c8",
    name: "Mahindra Scorpio",
    brand: "Mahindra",
    type: "SUV",
    priceMin: 13.62,
    priceMax: 17.42,
    rating: 4.4,
    transmission: "Manual",
    engine: "-",
    fuel: ["Diesel"],
    power: "-",
    mileage: "-",
    bootSpace: "-",
    seating: "-",
    colors: []
  },

  {
    id: "c3",
    name: "Toyota Taisor",
    brand: "Toyota",
    type: "SUV",
    priceMin: 7.74,
    priceMax: 13.04,
    rating: 4.2,
    transmission: "Manual / Automatic",
    engine: "998 cc - 1197 cc",
    fuel: ["Petrol", "CNG"],
    power: "76.43 - 98.69 bhp",
    mileage: "20 - 22.8 kmpl",
    bootSpace: "308 Liters",
    seating: "2-6",
    colors: []
  },

  {
    id: "c4",
    name: "Tata Punch",
    brand: "Tata",
    type: "SUV",
    priceMin: 6,
    priceMax: 10.2,
    rating: 4.5,
    transmission: "Manual / Automatic",
    engine: "1199 cc",
    fuel: ["Petrol", "CNG"],
    power: "72.41 - 86.63 bhp",
    mileage: "18.8 - 20.09 kmpl",
    bootSpace: "-",
    seating: "2",
    colors: []
  },

  {
    id: "c5",
    name: "Mahindra Thar ROXX",
    brand: "Mahindra",
    type: "SUV",
    priceMin: 12.99,
    priceMax: 20.49,
    rating: 4.7,
    transmission: "Manual / Automatic",
    engine: "1997 cc - 2184 cc",
    fuel: ["Petrol", "Diesel"],
    power: "150 - 174 bhp",
    mileage: "12.4 - 15.2 kmpl",
    bootSpace: "-",
    seating: "6",
    colors: ["Red", "Black", "Silver"]
  }
];