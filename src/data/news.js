// News section ka content. Official notice/number aaye to yahin edit karo.
// Link sirf un pages par hain jo site me pehle se exist karte hain.
export const featured = {
  to: '/products',
  tag: { en: 'Latest', hi: 'ताज़ा' },
  title: { en: 'Browse the full range of cars, bikes and home appliances', hi: 'कार, बाइक और घरेलू उपकरणों की पूरी श्रृंखला देखें' },
  text: { en: 'Compare models side by side and check price and availability before you order.', hi: 'ऑर्डर से पहले मॉडल की तुलना करें और कीमत व उपलब्धता देखें।' },
}

export const notices = [
  { to: '/info/buying-process', tag: { en: 'Guide', hi: 'मार्गदर्शिका' },
    title: { en: 'How to buy: the step-by-step process', hi: 'खरीदारी कैसे करें: चरण-दर-चरण प्रक्रिया' },
    text: { en: 'From registration to supply order and delivery, see every step in one place.', hi: 'पंजीकरण से लेकर सप्लाई ऑर्डर और डिलीवरी तक, हर चरण एक जगह देखें।' } },
  { to: '/info/verify-supply-order', tag: { en: 'Update', hi: 'अपडेट' },
    title: { en: 'Verify your supply order online', hi: 'अपना सप्लाई ऑर्डर ऑनलाइन सत्यापित करें' },
    text: { en: 'Keep your supply order number ready to check its details and status.', hi: 'विवरण और स्थिति जाँचने के लिए अपना सप्लाई ऑर्डर नंबर तैयार रखें।' } },
  { to: '/info/payments', tag: { en: 'Guide', hi: 'मार्गदर्शिका' },
    title: { en: 'How to make online payments', hi: 'ऑनलाइन भुगतान कैसे करें' },
    text: { en: 'Read the payment steps before you place your order to avoid delays.', hi: 'देरी से बचने के लिए ऑर्डर देने से पहले भुगतान के चरण पढ़ें।' } },
  { to: '/info/contact', tag: { en: 'Advisory', hi: 'सलाह' }, alert: true,
    title: { en: 'Be vigilant: services on this portal are free', hi: 'सतर्क रहें: इस पोर्टल की सेवाएँ निःशुल्क हैं' },
    text: { en: 'If anyone asks for money for registration or supply order release, report it immediately.', hi: 'पंजीकरण या सप्लाई ऑर्डर जारी करने के लिए कोई पैसे माँगे तो तुरंत सूचित करें।' } },
]

export const infoCards = [
  { id: 'helpdesk', icon: 'Headset',
    title: { en: 'CS Dte & SCPL Helpdesk', hi: 'सीएस डीटीई एवं एससीपीएल हेल्पडेस्क' },
    text: { en: 'Questions on registration, supply orders, payments or delivery? The helpdesk team can guide you.', hi: 'पंजीकरण, सप्लाई ऑर्डर, भुगतान या डिलीवरी से जुड़े प्रश्न? हेल्पडेस्क टीम आपका मार्गदर्शन करेगी।' },
    actions: [{ to: '/info/help-desk', key: 'helpDeskBtn' }, { to: '/info/contact', key: 'contactBtn', out: true }] },
  { id: 'note', icon: 'Info', title: { en: 'Please note', hi: 'कृपया ध्यान दें' },
    points: [
      { en: 'Keep your supply order number and registered mobile number ready before contacting the helpdesk.', hi: 'हेल्पडेस्क से संपर्क करने से पहले सप्लाई ऑर्डर नंबर और पंजीकृत मोबाइल नंबर तैयार रखें।' },
      { en: 'Check price, availability and delivery details on the product page before ordering.', hi: 'ऑर्डर से पहले उत्पाद पृष्ठ पर कीमत, उपलब्धता और डिलीवरी विवरण देखें।' },
      { en: 'Never share your password or OTP with anyone.', hi: 'अपना पासवर्ड या ओटीपी किसी से साझा न करें।' },
    ] },
  { id: 'bene', icon: 'BadgeCheck', title: { en: 'Important information for all beneficiaries', hi: 'सभी लाभार्थियों के लिए महत्वपूर्ण सूचना' },
    links: [
      { to: '/info/eligibility', label: { en: 'Check eligibility criteria', hi: 'पात्रता मानदंड देखें' } },
      { to: '/info/faq', label: { en: 'Read frequently asked questions', hi: 'अक्सर पूछे जाने वाले प्रश्न पढ़ें' } },
      { to: '/info/user-manual', label: { en: 'Download the user manual', hi: 'यूज़र मैन्युअल देखें' } },
    ] },
]
