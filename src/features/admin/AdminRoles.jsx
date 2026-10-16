import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { ROLES, ROLE_LABELS } from '../../permissions/roles';
import { ROLE_PERMISSIONS } from '../../permissions/permissions';

export const AdminRoles = () => {
  const roleData = Object.entries(ROLE_LABELS).map(([key, label]) => {
    const perms = ROLE_PERMISSIONS[key] || [];
    return {
      key,
      label,
      permissionsCount: perms.length,
      samplePermissions: perms.slice(0, 4).join(', ') + (perms.length > 4 ? ` (+${perms.length - 4} more)` : ''),
      scope: key === ROLES.ADMIN ? 'Global System' : key === ROLES.CSD_OFFICIAL ? 'Departmental / National' : key === ROLES.BENEFICIARY ? 'Self-Service' : 'Entity Restricted'
    };
  });

  const columns = [
    { header: 'Role Identifier', accessor: 'key', render: (r) => <code>{r.key}</code> },
    { header: 'Official Designation', accessor: 'label', render: (r) => <strong>{r.label}</strong> },
    { header: 'Scope', accessor: 'scope' },
    {
      header: 'Granted Permissions',
      accessor: 'permissionsCount',
      render: (r) => <span className="badge" style={{ background: '#f1f5f9', color: 'var(--navy)' }}>{r.permissionsCount} permissions</span>
    },
    { header: 'Permission Samples', accessor: 'samplePermissions', render: (r) => <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{r.samplePermissions}</span> }
  ];

  return (
    <div className="admin-roles-page">
      <PageHeader
        title="Enterprise RBAC Role Definitions"
        subtitle="Standardized authority levels, governance scopes, and permission allocations across the 9 AFD roles"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Roles' }
        ]}
      />

      <Card>
        <DataTable columns={columns} data={roleData} />
      </Card>
    </div>
  );
};
