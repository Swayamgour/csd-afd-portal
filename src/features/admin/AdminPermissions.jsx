import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { DataTable } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { PERMISSIONS, ROLE_PERMISSIONS } from '../../permissions/permissions';
import { ROLES, ROLE_LABELS } from '../../permissions/roles';

export const AdminPermissions = () => {
  const [search, setSearch] = useState('');

  const allPerms = Object.entries(PERMISSIONS).map(([groupKey, groupPerms]) => {
    return Object.entries(groupPerms).map(([actionKey, permString]) => {
      // Find roles having this permission
      const authorizedRoles = Object.entries(ROLE_PERMISSIONS)
        .filter(([r, perms]) => perms.includes(permString))
        .map(([r]) => ROLE_LABELS[r] || r);

      return {
        module: groupKey,
        permission: permString,
        roles: authorizedRoles
      };
    });
  }).flat();

  const filtered = allPerms.filter(p =>
    !search ||
    p.permission.toLowerCase().includes(search.toLowerCase()) ||
    p.module.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { header: 'Module', accessor: 'module', render: (p) => <span className="badge-perm-count">{p.module}</span> },
    { header: 'Permission Identifier', accessor: 'permission', render: (p) => <code>{p.permission}</code> },
    {
      header: 'Authorized Stakeholder Roles',
      accessor: 'roles',
      render: (p) => (
        <div className="portal-flex-wrap-gap-xs">
          {p.roles.map((r, idx) => (
            <span key={idx} className="badge-role-tag">
              {r}
            </span>
          ))}
        </div>
      )
    }
  ];

  return (
    <div className="admin-permissions-page">
      <PageHeader
        title="Permission Catalog & Access Control Matrix"
        subtitle="Centralized granular privilege dictionary enforcing the <Can permission='...' /> security boundary"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Permissions' }
        ]}
      />

      <Card>
        <div className="mb-lg">
          <SearchInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search permission token (e.g. demands.approve, tickets.escalate, users.edit)..."
          />
        </div>
        <DataTable columns={columns} data={filtered} />
      </Card>
    </div>
  );
};
