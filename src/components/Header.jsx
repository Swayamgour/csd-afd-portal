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
  Bell,
} from "lucide-react";
import { useGetNotificationsQuery } from "../features/notifications/notificationApi.js";
import { useStore } from "../context/Store.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import SearchBox from "./SearchBox.jsx";
import FontSizeResizer from "./common/FontSizeResizer.jsx";
import { normalizeRole } from "../permissions/roles.js";

const nav = [
  ["/", "Home"],
  ["/products?cat=car", "Cars"],
  ["/products?cat=bike", "Bikes"],
  ["/products?cat=white-goods", "Appliances"],
  ["/demands", "Demands"],
  ["/info/buying-process", "Buying Process"],
  ["/info/about", "About CSD"],
  ["/info/contact", "Contact"],
];
import { useGetBannersQuery } from "../features/admin/adminApi.js";

const DEFAULT_FORCES = [
  { name: "Indian Army", imageUrl: "https://afd.csdindia.gov.in/wp-content/themes/csdafdonline/assets/images/homepage/pics/08/Army.png" },
  { name: "Indian Navy", imageUrl: "https://afd.csdindia.gov.in/wp-content/themes/csdafdonline/assets/images/homepage/pics/2023/Indian-navy.png" },
  { name: "Indian Air Force", imageUrl: "https://afd.csdindia.gov.in/wp-content/themes/csdafdonline/assets/images/homepage/pics/2023/Air-force.png" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const loc = useLocation(),
    { cart, wish } = useStore();
  const { isAuthenticated, user, roleHome, role } = useAuth();
  const { data: dynamicBanners } = useGetBannersQuery({ position: 'forces_header' });

  // console.log()

  // const { data: me } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  const { data: notificationsResp } = useGetNotificationsQuery(undefined, { skip: !isAuthenticated });
  const unreadCount = notificationsResp?.unreadCount ?? (Array.isArray(notificationsResp?.data) ? notificationsResp.data.filter(n => !n.read && !n.isRead).length : 0);

  const forcesList = (dynamicBanners && dynamicBanners.length > 0) ? dynamicBanners : DEFAULT_FORCES;

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
            <FontSizeResizer />
            <Link to="/info/help-desk">
              <Phone size={13} aria-hidden /> Help Desk
            </Link>
            <span className="forces" aria-hidden>
              {forcesList.map((item, idx) => {
                const src = item.imageUrl || item;
                const title = item.name || "Armed Forces";
                return (
                  <img
                    key={item._id || item.id || src || idx}
                    src={src}
                    alt={title}
                    title={title}
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                );
              })}
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
            src="/assets/logo.png"
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
          {loc.pathname !== "/login" && loc.pathname !== "/register" && isAuthenticated && (
            <>
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

            </>
          )
          }
          {isAuthenticated && (
            <Link
              to="/beneficiary/notifications"
              className="act"
              aria-label={`Notifications, ${unreadCount} unread`}
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && <b>{unreadCount}</b>}
              <span>Alerts</span>
            </Link>
          )}
          {isAuthenticated && normalizeRole(role || user?.role) !== 'beneficiary' && (
            <Link
              to={roleHome || '/depot/dashboard'}
              className="act header-dashboard-link"
              aria-label="Department Dashboard"
              title="Go to Departmental Dashboard"
            >
              <span>Dashboard</span>
            </Link>
          )}
          {isAuthenticated && user ? (
            <Link
              to={normalizeRole(role || user.role) === 'beneficiary' ? '/beneficiary/profile' : (roleHome || '/depot/dashboard')}
              className="act"
              aria-label="User Profile"
              title={normalizeRole(role || user.role) === 'beneficiary' ? "View Beneficiary Profile" : "Go to Dashboard"}
            >
              <User size={20} color="var(--brand)" />
              <span className="header-user-label">
                {user?.name ? user.name.split(" ")[0] : (user?.username || "Profile")}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="act" aria-label="Login" title="Login to CSD AFD Portal">
              <User size={20} />
              <span>Login</span>
            </Link>
          )}
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
