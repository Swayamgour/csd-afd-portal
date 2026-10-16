import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { ROLES, ROLE_LABELS, ROLE_HOMES } from '../permissions/roles.js';
import { UserCheck } from 'lucide-react';

export default function RoleSwitcher() {
  const { role, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    switchRole(newRole);
    const dest = ROLE_HOMES[newRole] || '/beneficiary/dashboard';
    navigate(dest);
  };

  return (
    <div className="role-switcher-container row align-center gap-1">
      <UserCheck size={14} className="text-saffron" aria-hidden="true" />
      <span className="small font-semibold hide-mobile" style={{ color: '#fff' }}>Role:</span>
      <select
        value={role || ROLES.BENEFICIARY}
        onChange={handleRoleChange}
        className="role-switcher-select small"
        aria-label="Switch portal role persona"
      >
        {Object.entries(ROLE_LABELS).map(([rKey, rLabel]) => (
          <option key={rKey} value={rKey}>
            {rLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
