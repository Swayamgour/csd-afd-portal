import React from 'react';

export function Tabs({
  tabs = [], // [{ id: 'overview', label: 'Overview', badge?: 4, icon?: Icon }]
  activeTab,
  onChange,
  className = ''
}) {
  return (
    <div className={`tabbar-wrapper ${className}`} role="tablist">
      <div className="tabbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {Icon && <Icon size={16} aria-hidden="true" />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`tab-badge ${isActive ? 'tab-badge-active' : ''}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Tabs;
