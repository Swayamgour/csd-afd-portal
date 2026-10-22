import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';

export const AdminProfile = () => {
  const { user } = useAuth();

  return (
    <div className="admin-profile-page">
      <PageHeader
        title="System Administrator Credentials"
        subtitle="Cryptographic key fingerprint, security clearance, and root authorization profile"
        breadcrumbs={[
          { label: 'System Admin', href: '/admin/dashboard' },
          { label: 'Profile' }
        ]}
      />

      <div className="admin-profile-layout">
        <Card title="Root Security Principal">
          <div className="text-center mb-xl">
            <div className="admin-root-avatar">
              SA
            </div>
            <h3 className="m-0 mb-xs">{user?.name || 'System Administrator'}</h3>
            <span className="badge-superuser-pill">
              Superuser / Full Authority
            </span>
          </div>

          <div className="admin-principal-details">
            <div>
              <span className="portal-subtext-muted d-block fs-xs">OFFICIAL PRINCIPAL</span>
              <strong>admin@csdindia.gov.in</strong>
            </div>
            <div>
              <span className="portal-subtext-muted d-block fs-xs">GPG KEY ID</span>
              <span className="font-mono">4A89 7DF1 92B0 CA14</span>
            </div>
            <div>
              <span className="portal-subtext-muted d-block fs-xs">SECURITY CLEARANCE</span>
              <span>Level 1 Secret (MoD IT Infrastructure)</span>
            </div>
          </div>
        </Card>

        <Card title="Root Privileges & Delegation">
          <div className="flex-col-gap-md">
            <div className="privileged-operations-box">
              <h4 className="m-0 mb-sm fs-md">Privileged Operations</h4>
              <ul className="privileged-operations-list">
                <li>Global tenant user provisioning, account termination, and lockout overrides</li>
                <li>Emergency maintenance mode triggering and cyber treasury pause</li>
                <li>Cryptographic log verification and immutable export</li>
                <li>System-wide broadcast dispatch across mobile and web</li>
              </ul>
            </div>

            <div className="flex-end-gap-sm mt-md">
              <Button variant="outline">Rotate SSH Keypair</Button>
              <Button variant="secondary">Regenerate 2FA Backup Codes</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
