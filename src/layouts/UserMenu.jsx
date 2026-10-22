import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLE_LABELS, ROLE_HOMES, normalizeRole } from '../permissions/roles.js';
import { User, LogOut, Shield, ChevronDown, Settings, LayoutDashboard } from 'lucide-react';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const { user, role, logout } = useAuth();
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const normRole = normalizeRole(role || user?.role);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getProfileLink = () => {
    switch (normRole) {
      case 'beneficiary':
        return '/beneficiary/profile';
      case 'csd':
        return '/csd/settings';
      case 'depot':
        return '/depot/profile';
      case 'urc':
        return '/urc/profile';
      case 'oem':
        return '/oem/profile';
      case 'dealer':
        return '/dealer/profile';
      case 'helpdesk_agent':
      case 'helpdesk_supervisor':
        return '/helpdesk/profile';
      case 'admin':
        return '/admin/profile';
      default:
        return '/beneficiary/profile';
    }
  };

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      <button
        type="button"
        className="user-menu-trigger"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className="user-avatar-circle">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            <User size={16} />
          )}
        </div>
        <div className="user-menu-info text-left hide-mobile">
          <span className="user-menu-name small font-semibold block">{user?.name}</span>
          <span className="user-menu-role muted small block">{ROLE_LABELS[normRole] || ROLE_LABELS[role] || role}</span>
        </div>
        <ChevronDown size={14} className="text-muted hide-mobile" />
      </button>

      {open && (
        <div className="user-dropdown-menu panel shadow-lg" role="menu">
          <div className="user-dropdown-header mb-1 pb-1 border-bottom">
            <p className="small font-bold mb-0">{user?.name}</p>
            <p className="small muted mb-0">{user?.email || user?.serviceNumber}</p>
            <div className="user-badges-flex">
              <span className="badge-pill badge-primary badge-sm">
                {ROLE_LABELS[normRole] || ROLE_LABELS[role] || role}
              </span>
              {normRole === 'beneficiary' && (
                <span
                  className={`badge-pill badge-sm ${(user?.status === 'Active' || user?.adminApproval === 'APPROVED' || user?.verificationStatus === 'APPROVED' || user?.verificationStatus === 'VERIFIED') ? 'badge-status-approved' : 'badge-status-pending'}`}
                >
                  {(user?.status === 'Active' || user?.adminApproval === 'APPROVED' || user?.verificationStatus === 'APPROVED' || user?.verificationStatus === 'VERIFIED') ? '✓ Approved' : '⏳ Approval Pending'}
                </span>
              )}
            </div>
          </div>

          <div className="user-dropdown-links">
            <Link
              to={normRole === 'beneficiary' ? '/beneficiary/dashboard' : (ROLE_HOMES[normRole] || ROLE_HOMES[role] || '/admin/dashboard')}
              className="user-dropdown-item row align-center gap-1 small"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <LayoutDashboard size={15} />
              <span>{normRole === 'beneficiary' ? 'Beneficiary Dashboard' : 'Control Dashboard'}</span>
            </Link>

            <Link
              to={getProfileLink()}
              className="user-dropdown-item row align-center gap-1 small"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <User size={15} />
              <span>My Profile & Entitlements</span>
            </Link>

            <Link
              to="/beneficiary/settings"
              className="user-dropdown-item row align-center gap-1 small"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <Settings size={15} />
              <span>Account Security</span>
            </Link>

            <Link
              to="/"
              className="user-dropdown-item row align-center gap-1 small"
              onClick={() => setOpen(false)}
              role="menuitem"
            >
              <Shield size={15} />
              <span>CSD AFD Public Portal</span>
            </Link>
          </div>

          <div className="user-dropdown-footer mt-1 pt-1 border-top">
            <button
              type="button"
              className="user-logout-btn row align-center gap-1 small text-danger wide text-left"
              onClick={handleLogout}
              role="menuitem"
            >
              <LogOut size={15} />
              <span>Secure Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
