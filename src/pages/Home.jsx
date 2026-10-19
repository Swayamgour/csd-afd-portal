import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowRight, Headset, Info, ShieldAlert, BadgePercent, BadgeCheck, Truck, Wallet, Car, Bike, Refrigerator, BookOpen, FileCheck2, CircleCheck, Phone } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import SearchBox from "../components/SearchBox.jsx";
import Catalog from "../components/Catalog.jsx";
import { products } from "../data/products.js";
import { onImgError } from "../data/utils.js";

const img = (id) => products.find((p) => p.id === id);
const cats = [
  ["Automobiles", "Cars", "/products?cat=car", "car", "c5",'/assets/maruti1.png' , Car, products.filter((p) => p.category === "car").length],
  ["Automobiles", "Bikes", "/products?cat=bike", "bike", "b4",'/assets/bullet1.png' , Bike, products.filter((p) => p.category === "bike").length],
  ["Home & Living", "Appliances", "/products?cat=white-goods", "app", "w6",'/assets/white_goods1.png' , Refrigerator, products.filter((p) => p.category === "white-goods").length],
];
const perks = [
  [BadgePercent, "Concessional prices", "Special CSD rates for the Armed Forces family"],
  [BadgeCheck, "100% free service", "No agent or registration fee, ever"],
  [Wallet, "Easy online payment", "Pay securely against your supply order"],
  [Truck, "Supply order delivery", "Track and verify your order online"],
];
const topBrands = Object.entries(products.reduce((m, p) => ((m[p.brand] = (m[p.brand] || 0) + 1), m), {})).sort((a, b) => b[1] - a[1]).slice(0, 12);
const deals = products.filter((p) => p.discount > 0).sort((a, b) => b.discount - a.discount).slice(0, 5);

const featured = { to: "/products", tag: "Latest", title: "Browse the full range of cars, bikes and home appliances", text: "Compare models side by side and check price and availability before you order." };
const notices = [
  { to: "/info/buying-process", icon: BookOpen, tag: "Guide", title: "How to buy: the step-by-step process", text: "From registration to supply order and delivery, see every step in one place." },
  { to: "/info/verify-supply-order", icon: FileCheck2, tag: "Update", title: "Verify your supply order online", text: "Keep your supply order number ready to check its details and status." },
  { to: "/info/payments", icon: Wallet, tag: "Guide", title: "How to make online payments", text: "Read the payment steps before you place your order to avoid delays." },
  { to: "/info/contact", icon: ShieldAlert, tag: "Advisory", alert: true, title: "Be vigilant: services on this portal are free", text: "If anyone asks for money for registration or supply order release, report it immediately." },
];

export const Shop = ({ to = "/products", children = "Shop now" }) => (
  <Link to={to} className="shop">{children}<span><ArrowUpRight size={18} aria-hidden /></span></Link>
);

export default function Home() {
  const [cat, setCat] = useState("car");
  return (
    <div className="home">

      <section className="hero" aria-labelledby="h1">
        {/* Background Image Slider */}
        <div className="hero-slider">
          <img src="/assets/home_page.png" alt="" />
          <img src="/assets/home_page.png" alt="" />
          <img src="/assets/home_page.png" alt="" />
        </div>

        {/* Dark overlay */}
        <div className="hero-overlay"></div>

        {/* Content above slider */}
        <div className="hero-content">
          <h1 id="h1">
            CSD AFD
            <br />
            ONLINE
          </h1>

          <Shop to="/products?cat=car" />

          {/* <p className="ticker" role="note">
                  <strong>IMPORTANT:</strong> [Official notice to be provided]
                </p> */}
        </div>
      </section>



      <div className="wrap">
        <ul className="perks">
          {perks.map(([Ic, t, s]) => (<li key={t}><span><Ic size={22} aria-hidden /></span><div><strong>{t}</strong><small>{s}</small></div></li>))}
        </ul>

        <section aria-labelledby="cats">
          <div className="sec-h"><h2 id="cats">Shop by category</h2></div>

          <ul className="grid3 cats">
            {cats.map(([s, t, to, k, im , img], i) => (
              <li key={t} className={i === 2 ? "wide2" : ""}>
                <Link className={`cat ${k}`} to={to}>
                  <small>{s}</small>
                  <strong>{t}</strong>
                  <span className="cta">Explore <ArrowUpRight size={15} aria-hidden /></span>
                  <img src={img} alt="" loading="lazy" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section id="shop" aria-labelledby="shop-h" className="shop-sec">
          <div className="sec-h"><h2 id="shop-h">Explore the range</h2><Link to={`/products?cat=${cat}`} className="more">View all <ArrowRight size={15} aria-hidden /></Link></div>
          <Catalog cat={cat} onCat={setCat} embedded title={{ car: "Cars", bike: "Bikes", "white-goods": "Home appliances" }[cat]} />
        </section>

        {/* <section aria-labelledby="deals">
          <div className="sec-h"><h2 id="deals">Top discounts</h2><Link to="/products?cat=white-goods" className="more">All appliances <ArrowRight size={15} aria-hidden /></Link></div>
          <div className="pgrid five">{deals.map((p) => <ProductCard key={p.id} p={p} />)}</div>
        </section> */}

        <section aria-labelledby="brands">
          <div className="sec-h"><h2 id="brands">Popular brands</h2></div>
          <ul className="brands">
            {topBrands.map(([b, n]) => (<li key={b}><Link to={`/search?q=${encodeURIComponent(b)}`}><strong>{b}</strong><small>{n} product{n > 1 ? "s" : ""}</small></Link></li>))}
          </ul>
        </section>

        {/* ===================== NEWS & NOTICES ===================== */}
        <section aria-labelledby="news" className="news">
          <div className="sec-h"><h2 id="news">News &amp; notices</h2></div>

          <div className="news-grid">
            {/* Featured story */}
            <Link to={featured.to} className="news-feature">
              <img className="news-feature-img" src="/assets/news.jpg" alt="" loading="lazy" />
              <div className="news-feature-body">
                <span className="news-chip light">{featured.tag}</span>
                <h3>{featured.title}</h3>
                <p>{featured.text}</p>
                <span className="news-more">Read more <ArrowRight size={16} aria-hidden /></span>
              </div>
            </Link>

            {/* Notices */}
            <ul className="news-list">
              {notices.map(({ icon: Ic, ...n }) => (
                <li key={n.to}>
                  <Link to={n.to} className={`news-item ${n.alert ? "alert" : ""}`}>
                    <span className="news-ic" aria-hidden><Ic size={20} /></span>
                    <span className="news-txt">
                      <span className={`news-chip ${n.alert ? "alert" : ""}`}>{n.tag}</span>
                      <strong>{n.title}</strong>
                      <span className="news-sub">{n.text}</span>
                    </span>
                    <ArrowRight className="news-go" size={18} aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>

            {/* Help + notes */}
            <div className="news-cards">
              <article className="news-help">
                <span className="news-help-ic" aria-hidden><Headset size={26} /></span>
                <div>
                  <h3>CS DTE &amp; SCPL Helpdesk</h3>
                  <p>Questions on registration, supply orders, payments or delivery? The helpdesk team can guide you.</p>
                  <div className="row">
                    <Link to="/info/help-desk" className="btn light"><Headset size={16} aria-hidden /> Help Desk</Link>
                    <Link to="/info/contact" className="btn ghost-l"><Phone size={16} aria-hidden /> Contact us</Link>
                  </div>
                </div>
              </article>

              <article className="news-note">
                <div className="news-note-head">
                  <span className="news-ic amber" aria-hidden><Info size={20} /></span>
                  <h3>Please note</h3>
                </div>
                <ul>
                  <li><CircleCheck size={18} aria-hidden /><span>Keep your supply order number and registered mobile number ready before contacting the helpdesk.</span></li>
                  <li><CircleCheck size={18} aria-hidden /><span>Check price, availability and delivery details on the product page before ordering.</span></li>
                  <li><CircleCheck size={18} aria-hidden /><span>Never share your password or OTP with anyone.</span></li>
                </ul>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}