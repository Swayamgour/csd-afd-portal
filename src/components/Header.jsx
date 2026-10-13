import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { useStore } from "../context/Store.jsx";
import SearchBox from "./SearchBox.jsx";

const nav = [
  ["/", "Home"],
  ["/products?cat=car", "Cars"],
  ["/products?cat=bike", "Bikes"],
  ["/products?cat=white-goods", "Appliances"],
  ["/info/buying-process", "Buying Process"],
  ["/info/about", "About CSD"],
  ["/info/contact", "Contact"],
];
const forces = [
  "https://afd.csdindia.gov.in/wp-content/themes/csdafdonline/assets/images/homepage/pics/08/Army.png",
  "https://afd.csdindia.gov.in/wp-content/themes/csdafdonline/assets/images/homepage/pics/2023/Indian-navy.png",
  "https://afd.csdindia.gov.in/wp-content/themes/csdafdonline/assets/images/homepage/pics/2023/Air-force.png",
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation(),
    { cart, wish } = useStore();
  const cur = loc.pathname + loc.search;
  const isActive = (to) =>
    to === "/"
      ? loc.pathname === "/"
      : to.includes("?")
        ? cur === to ||
        (loc.pathname === "/products" && !loc.search && to.endsWith("car"))
        : loc.pathname === to;

  return (
    <header className="hdr">
      <div className="hdr-util">
        <div className="hdr-util-in">
          <p>
            <ShieldCheck size={14} aria-hidden /> Services on this portal are
            free — never pay anyone for registration or supply order.
          </p>
          <div className="hdr-util-r">
            <Link to="/info/help-desk">
              <Phone size={13} aria-hidden /> Help Desk
            </Link>
            <span className="forces" aria-hidden>
              {forces.map((s) => (
                <img
                  key={s}
                  src={s}
                  alt=""
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              ))}
            </span>
          </div>
        </div>
      </div>

      <div className="hdr-main">
        <button
          className="icon menu"
          aria-expanded={open}
          aria-controls="mainnav"
          aria-label="Menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <Link to="/">
          <img
            src="https://afd.csdindia.gov.in/wp-content/uploads/media/2023/01/header.png"
            // width="300"
            className="csd-logo"
          />
        </Link>
        {/* className="brand" aria-label="CSD AFD Online, home">
          <span className="brand-mark" aria-hidden>CSD</span>
          <span className="brand-txt"><strong>AFD Online</strong><small>Canteen Stores Department</small></span>
        </Link> */}
        {loc.pathname !== "/login" && loc.pathname !== "/register" && (
          <SearchBox variant="header" />
        )}
        <div className="actions">
          <Link
            to="/products?wish=1"
            className="act"
            aria-label={`Wishlist, ${wish.length} items`}
          >
            <Heart size={20} />
            {wish.length > 0 && <b>{wish.length}</b>}
            <span>Wishlist</span>
          </Link>
          <Link
            to="/cart"
            className="act"
            aria-label={`Cart, ${cart.length} items`}
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && <b>{cart.length}</b>}
            <span>Cart</span>
          </Link>
          <Link to="/login" className="act" aria-label="Login">
            <User size={20} />
            <span>Login</span>
          </Link>
        </div>
      </div>

      {loc.pathname !== "/login" && loc.pathname !== "/register" && (
        <nav
          id="mainnav"
          aria-label="Main"
          className={open ? "nav open" : "nav"}
        >
          <ul>
            {nav.map(([to, l]) => (
              <li key={l}>
                <Link
                  to={to}
                  className={isActive(to) ? "active" : ""}
                  aria-current={isActive(to) ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {l}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
