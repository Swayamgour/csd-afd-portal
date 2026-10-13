// Indicative content shown on the product detail page. Replace with real per-model data from your API
// (fetchProduct in data/api.js) when available. Everything here is generic per category.
export const FEATURES = {
  car: [
    ['Safety', ['Airbags for driver and front passenger', 'ABS with EBD', 'Rear parking sensors', 'Seat-belt reminder', 'ISOFIX child-seat anchors']],
    ['Comfort & convenience', ['Air conditioning', 'Power windows and central locking', 'Steering-mounted controls', 'USB charging points', 'Tilt-adjustable steering']],
    ['Infotainment', ['Touchscreen infotainment system', 'Bluetooth, USB and AUX connectivity', 'Smartphone integration', 'Multi-speaker audio system']],
  ],
  bike: [
    ['Safety', ['Disc brake at the front', 'Combined or anti-lock braking (variant dependent)', 'Engine kill switch', 'Side-stand cut-off']],
    ['Comfort & convenience', ['Tubeless tyres', 'Comfortable split seat', 'Digital or analog instrument cluster', 'LED / halogen headlamp (variant dependent)']],
  ],
  'white-goods': [
    ['Highlights', ['Energy-efficient operation', 'Warranty as per manufacturer terms', 'Free installation support (brand dependent)', 'GST invoice provided']],
  ],
}

export const STEPS = [
  ['Register & log in', 'Create your account with your service details and log in using the OTP sent to your email.', '/login'],
  ['Choose & add to cart', 'Pick your product, check variant, colour and price, then add it to your cart.', '/cart'],
  ['Get your supply order', 'Submit the request. Your supply order is issued after verification — no payment to agents.', '/info/buying-process'],
  ['Pay & take delivery', 'Pay online as per the supply order, then verify and track your delivery.', '/info/payments'],
]
