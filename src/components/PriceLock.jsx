import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

/** true only for a logged-in user - prices are never shown to visitors. */
export const useCanSeePrice = () => Boolean(useAuth().isAuthenticated);

/**
 * Replaces a price while the visitor is logged out.
 *   <PriceLock />            small inline "Login to view price" link
 *   <PriceLock block />      bigger card (product page)
 */
export default function PriceLock({ block = false, className = "" }) {
  const { pathname, search } = useLocation();
  const to = `/login?redirect=${encodeURIComponent(pathname + search)}&reason=auth-required`;

  if (block) {
    return (
      <div className={`price-lock-card ${className}`}>
        <span className="price-lock-icon">
          <Lock size={20} aria-hidden />
        </span>
        <div className="price-lock-text">
          <strong>Prices are visible after login</strong>
          <span>Log in with your CSD account to see the state-wise concessional price.</span>
        </div>
        <Link to={to} className="btn price-lock-btn">
          Login to view price
        </Link>
      </div>
    );
  }
  return (
    <Link to={to} className={`price-lock-inline ${className}`}>
      <Lock size={13} aria-hidden /> Login to view price
    </Link>
  );
}
