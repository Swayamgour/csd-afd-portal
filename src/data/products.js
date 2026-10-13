// Prices/specs below are taken from the reference screenshots. MOCK DATA - replace via src/data/api.js.
const fm = v => (Number.isInteger(v) ? String(v) : v.toFixed(2))
const car = (id, name, brand, type, lo, hi, rating, trans, engine, fuel, power, mileage, boot, airbags, colors, image) =>
({
  id, img: `/img/${id}.jpg`, image, images: [
    image,
    `/img/${id}/front.jpg`,
    `/img/${id}/rear.jpg`,
    `/img/${id}/left.jpg`,
    `/img/${id}/right.jpg`,
    `/img/${id}/side.jpg`,
  ], category: 'car', name, brand, type, lo, hi, price: `₹${fm(lo)} - ${fm(hi)} Lakh`, rating, reviews: 984, trans, engine, fuel, power, mileage, boot, airbags, colors
})
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
) =>
({
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
  price: `₹${fm(lo)} - ${fm(hi)}`,
  rating,
  reviews: 984,
  engine,
  fuel,
  power,
  mileage,
  brakes,
  colors,
});
const appl = (id, name, brand, type, price, mrp, rating, reviews, image) =>
  ({ id, img: `/img/${id}.jpg`, image, category: 'white-goods', name, brand, type, price: `₹${price.toLocaleString('en-IN')}`, lo: price, hi: price, mrp, discount: Math.round((1 - price / mrp) * 100), rating, reviews })
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