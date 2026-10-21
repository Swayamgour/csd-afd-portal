import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_SIDEBAR_NAV } from './navConfig.js';
import { ROLE_LABELS, normalizeRole } from '../permissions/roles.js';
import { ShieldCheck, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  collapsed = false,
  onToggleCollapse
}) {
  const { role, user } = useAuth();
  const normRole = normalizeRole(role || user?.role);
  const navItems = ROLE_SIDEBAR_NAV[normRole] || ROLE_SIDEBAR_NAV[role] || ROLE_SIDEBAR_NAV.beneficiary;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="sidebar-backdrop show-mobile"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open-mobile' : ''}`}
        aria-label="Portal Navigation"
      >
        {/* Brand / Logo Area */}
        <div className="sidebar-brand between">
          <Link to="/" className="sidebar-brand-link row align-center gap-1">
            <span className="sidebar-emblem" aria-hidden="true">
              <ShieldCheck size={20} />
            </span>
            {!collapsed && (
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-main font-bold block">CSD AFD</span>
                <span className="sidebar-brand-sub muted small block">Enterprise Portal</span>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            className="sidebar-mobile-close show-mobile circle"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Active Role Indicator */}
        {!collapsed && (
          <div className="sidebar-role-badge-box">
            <span className="sidebar-role-title small muted block">Portal Module</span>
            <span className="sidebar-role-name font-semibold small block text-saffron">
              {ROLE_LABELS[normRole] || ROLE_LABELS[role] || role}
            </span>
            {user?.depot && <span className="sidebar-depot-tag micro muted block">{user.depot}</span>}
          </div>
        )}

        {/* Navigation List */}
        <nav className="sidebar-nav no-scrollbar">
          <ul className="sidebar-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.to} className="sidebar-nav-item">
                  <NavLink
                    to={item.to}
                    end={item.to.endsWith('/dashboard')}
                    className={({ isActive }) =>
                      `sidebar-nav-link row align-center gap-1 ${isActive ? 'active' : ''}`
                    }
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    title={collapsed ? item.title : undefined}
                  >
                    <Icon size={18} className="sidebar-nav-icon" aria-hidden="true" />
                    {!collapsed && <span className="sidebar-nav-label small">{item.title}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer Link */}
        <div className="sidebar-footer">
          <Link to="/" className="sidebar-public-link row align-center gap-1 small muted">
            <ExternalLink size={15} />
            {!collapsed && <span>Public Storefront</span>}
          </Link>
          {onToggleCollapse && (
            <button
              type="button"
              className="sidebar-collapse-toggle hide-mobile circle"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
