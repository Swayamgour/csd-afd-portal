import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import HeaderBar from './HeaderBar.jsx';
import Breadcrumbs from './Breadcrumbs.jsx';

export function AppShell({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app-shell-root">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      {/* Main Container */}
      <div className={`app-main-wrapper ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Top Header */}
        <HeaderBar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Breadcrumb Navigation Bar */}
        <div className="app-breadcrumb-bar">
          <Breadcrumbs />
        </div>

        {/* Content Viewport */}
        <main id="portal-main" className="app-content-body" tabIndex={-1}>
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}

export default AppShell;
