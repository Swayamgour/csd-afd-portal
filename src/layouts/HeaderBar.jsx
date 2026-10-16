import React from 'react';
import { Menu, HelpCircle, Search, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import NotificationCenter from './NotificationCenter.jsx';
import UserMenu from './UserMenu.jsx';
import RoleSwitcher from './RoleSwitcher.jsx';

export default function HeaderBar({ onToggleSidebar }) {
  return (
    <header className="app-header-bar between">
      <div className="header-left row align-center gap-1">
        <button
          type="button"
          className="header-menu-btn icon-btn show-mobile circle"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="header-branding-badge hide-mobile row align-center gap-1">
          <ShieldCheck size={16} className="text-saffron" />
          <span className="small font-semibold" style={{ color: '#ffffff' }}>
            Government of India · Ministry of Defence · CSD AFD
          </span>
        </div>
      </div>

      <div className="header-right row align-center gap-1">
        {/* Role Persona Switcher for pair-testing and demonstration */}
        <RoleSwitcher />

        {/* Helpdesk shortcut */}
        <Link
          to="/helpdesk/knowledge-base"
          className="header-icon-btn circle"
          title="Helpdesk & Guidelines"
          aria-label="Help and Knowledge Base"
        >
          <HelpCircle size={18} />
        </Link>

        {/* Notifications */}
        <NotificationCenter />

        {/* User Account Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
